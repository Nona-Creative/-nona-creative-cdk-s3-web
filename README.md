## AWS CDK S3 Web UI Construct

This CDK construct can be used in an AWS CDK stack which deploys a static site to an S3 bucket.

The CDK construct also creates a cloudfront distribution attached to the s3 origin of the bucket.

On deploy of your CDK stack, it will deploy your sites assets from path location set on `staticSiteBuildPath` property to the S3 bucket.

A Cloudfront cache invalidation of the assets automatically takes place when modified assets have been deployed to the S3 bucket

## Usage example

```js
import { Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core'
import { S3WebUI } from '@nona-creative/cdk-s3-web'

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const s3WebUi = new S3WebUI(this, 'S3WebUIDeployment', {
      bucketName: 'my-new-random-site',
      staticSiteBuildPath: 'build',
      staticSiteEntry: 'index.html',
    })

    // ------------------------------------
    // Outputs
    // ------------------------------------

    new CfnOutput(this, 'CloudfrontDistributionDomainOutput', {
      value: s3WebUi.cloudfrontDistribution.domainName,
      exportName: 'CloudfrontDistribution',
    })

    new CfnOutput(this, 'CloudfrontDistributionIdOutput', {
      value: s3WebUi.cloudfrontDistribution.distributionId,
      exportName: 'CloudfrontDistributionId',
    })
  }
}
```

## Construct options

- `bucketName` - The name of your S3 bucket. Needs to be unique to the global space
- `staticSiteBuildPath` - Location of your static site build
- `staticSiteEntry` - Entry point for your static site, most of the time this is your `index.html`
- `bucketProps` - Additional options for the S3 bucket. See [CDK BucketProps](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-s3.BucketProps.html)
- `cloudfrontProps` - Additional options for the Cloudfront distribution. See [CDK CloudfrontProps](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cloudfront.CloudFrontWebDistributionProps.html)
