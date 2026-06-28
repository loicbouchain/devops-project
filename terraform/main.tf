# 1. Déclaration du Bucket S3
resource "aws_s3_bucket" "mon_bucket" {
  bucket = "mon-bucket-terraform" # Le nom de ton bucket
}

# 2. Déclaration de la file SQS
resource "aws_sqs_queue" "ma_file" {
  name                      = "ma-file-terraform"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400 # 1 jour
}