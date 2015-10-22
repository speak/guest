#!/usr/bin/env bash

echo "Deploying to $1"
ENVIRONMENT=$1

DEFAULT="speak"
BUCKET=speak-${ENVIRONMENT}-guest
echo "bucket is $BUCKET"
DIR=build/
aws s3 sync $DIR s3://$BUCKET --acl=public-read --delete
