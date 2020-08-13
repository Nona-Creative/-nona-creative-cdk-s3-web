import { Construct, CfnOutput, RemovalPolicy } from '@aws-cdk/core'
import { IBucket, Bucket, BucketProps } from '@aws-cdk/aws-s3'
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment'
import { CloudFrontWebDistribution, CloudFrontWebDistributionProps } from '@aws-cdk/aws-cloudfront'
import { mergeRight } from 'ramda'

export interface S3WebUiProps {
  /**
   * The name of your S3 bucket where your assets will be stored
   * @example - "MyStaticSiteS3Bucket"
   */
  bucketName: string
  /**
   * Entry point to your site
   * @example - "index.html"
   */
  staticSiteEntry: string
  /**
   * Static site build path containing your site assets
   * @example - "/src/build"
   */
  staticSiteBuildPath: string
  /**
   * S3 bucket properties that you want added to the construct
   * @default - { publicReadAccess: true }
   */
  bucketProps?: Omit<BucketProps, 'bucketName' | 'websiteIndexDocument'>
  /**
   * Cloudfront distribution properties that can be added to the construct
   * @default - { behaviors: [{ isDefaultBehavior: true }] }
   */
  cloudfrontProps?: Omit<CloudFrontWebDistributionProps, 'originConfigs'>
}

export class S3WebUI extends Construct {
  public readonly s3Bucket: IBucket
  public readonly cloudfrontDistribution: CloudFrontWebDistribution
  public readonly s3BucketDeployment: BucketDeployment
  public readonly outputs: CfnOutput

  constructor(scope: Construct, id: string, props: S3WebUiProps) {
    super(scope, id)

    const { bucketName, staticSiteBuildPath, staticSiteEntry, bucketProps, cloudfrontProps } = props

    const defaultBucketProps: BucketProps = {
      bucketName,
      publicReadAccess: true,
      websiteIndexDocument: staticSiteEntry,
      removalPolicy: RemovalPolicy.DESTROY,
    }

    const combinedBucketProps = bucketProps ? mergeRight(defaultBucketProps, bucketProps) : defaultBucketProps

    // ------------------------------------
    // S3
    // ------------------------------------

    this.s3Bucket = new Bucket(this, 'BucketId', combinedBucketProps)

    const defaultCloudfrontDistributionProps: CloudFrontWebDistributionProps = {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: this.s3Bucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    }

    const combinedCloudfrontDistributionProps = cloudfrontProps
      ? mergeRight(defaultCloudfrontDistributionProps, cloudfrontProps)
      : defaultCloudfrontDistributionProps

    // ------------------------------------
    // Cloudfront Distribution
    // ------------------------------------

    this.cloudfrontDistribution = new CloudFrontWebDistribution(
      this,
      'DistributionId',
      combinedCloudfrontDistributionProps,
    )

    // ------------------------------------
    // S3 Deployment
    // ------------------------------------

    this.s3BucketDeployment = new BucketDeployment(this, 'BucketDeploymentId', {
      sources: [Source.asset(staticSiteBuildPath)],
      destinationBucket: this.s3Bucket,
      distribution: this.cloudfrontDistribution,
    })
  }
}
