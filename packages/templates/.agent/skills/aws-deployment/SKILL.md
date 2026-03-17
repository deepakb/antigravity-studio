# SKILL: AWS Deployment

## Overview
Production-grade deployment patterns for TypeScript/Next.js applications on **Amazon Web Services (AWS)**. Covers Amplify Gen 2, ECS Fargate, Lambda, CloudFront + S3, and AWS CDK.

## Option A: AWS Amplify Gen 2 (Easiest for Next.js)
```typescript
// amplify/backend.ts — TypeScript-native IaC
import { defineBackend, defineAuth, defineStorage } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { storage } from './storage/resource';

export const backend = defineBackend({ auth, storage });

// amplify/auth/resource.ts
import { defineAuth } from '@aws-amplify/backend';
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
      },
    },
  },
});
```

```bash
# Deploy to Amplify
npm create amplify@latest  # Initialize
npx ampx sandbox           # Local sandbox (dev)
npx ampx pipeline-deploy   # CI/CD
```

## Option B: ECS Fargate (Docker Container — Production)
### Dockerfile (Multi-Stage)
```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production (smallest possible image)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### AWS CDK Stack (TypeScript)
```typescript
// infra/lib/app-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC with public/private subnets
    const vpc = new ec2.Vpc(this, 'AppVpc', {
      maxAzs: 3,
      natGateways: 1, // One NAT gateway saves cost vs 3
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'AppCluster', {
      vpc,
      containerInsights: true,
    });

    // ECR Repository
    const repo = new ecr.Repository(this, 'AppRepo', {
      repositoryName: 'my-nextjs-app',
      lifecycleRules: [{ maxImageCount: 10 }],
    });

    // Secrets from Secrets Manager
    const dbSecret = secretsmanager.Secret.fromSecretNameV2(
      this, 'DbSecret', 'prod/app/database'
    );

    // Fargate Task Definition
    const taskDef = new ecs.FargateTaskDefinition(this, 'AppTask', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    const container = taskDef.addContainer('AppContainer', {
      image: ecs.ContainerImage.fromEcrRepository(repo, 'latest'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'app' }),
      environment: { NODE_ENV: 'production' },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(dbSecret, 'url'),
        NEXTAUTH_SECRET: ecs.Secret.fromSecretsManager(dbSecret, 'authSecret'),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
        interval: cdk.Duration.seconds(30),
      },
    });
    container.addPortMappings({ containerPort: 3000 });

    // Fargate Service with ALB
    const fargateService = new ecs.FargateService(this, 'AppService', {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 2,
      assignPublicIp: false, // Private subnet
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, 'AppALB', {
      vpc,
      internetFacing: true,
    });

    const listener = alb.addListener('Listener', { port: 443, open: true });
    listener.addTargets('AppTarget', {
      port: 3000,
      targets: [fargateService],
      healthCheck: { path: '/api/health' },
    });

    // Auto-scaling
    const scaling = fargateService.autoScaleTaskCount({ maxCapacity: 10, minCapacity: 2 });
    scaling.scaleOnCpuUtilization('CpuScaling', { targetUtilizationPercent: 70 });
    scaling.scaleOnRequestCount('RequestScaling', {
      requestsPerTarget: 1000,
      targetGroup: listener.addTargets('ScaleTarget', { port: 3000, targets: [fargateService] }),
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: alb.loadBalancerDnsName });
  }
}
```

## Option C: AWS Lambda (Serverless API)
```typescript
// Using Serverless Framework or AWS CDK
// Perfect for Node.js/Express API handlers

// lambda/handler.ts
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

const app = express();
app.use(express.json());
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

export const handler = serverlessExpress({ app });
```

## GitHub Actions for AWS
```yaml
# .github/workflows/aws-deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: my-nextjs-app
  ECS_SERVICE: app-service
  ECS_CLUSTER: app-cluster
  CONTAINER_NAME: AppContainer

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write    # For OIDC auth (no long-lived keys!)
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC — no AWS keys in GitHub!)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/github-deploy
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.ecr-login.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_ENV

      - name: Update ECS task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: ${{ env.CONTAINER_NAME }}
          image: ${{ env.IMAGE }}

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

## CloudFront + S3 (Static Sites)
```bash
# Next.js static export
# next.config.ts: output: 'export'
npm run build

# Upload to S3
aws s3 sync out/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1234 --paths "/*"
```

## Key AWS Cost Tips
- Use OIDC (not IAM users) for GitHub Actions — no long-lived credentials
- Enable S3 Intelligent-Tiering for storage cost optimization
- Use Savings Plans (not Reserved Instances) for Fargate
- Enable Cost Anomaly Detection for surprise bill alerts
