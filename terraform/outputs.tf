output "bucket_name" {
  description = "Le nom du bucket de stockage"
  value       = aws_s3_bucket.mon_bucket.id
}

output "sqs_queue_url" {
  description = "L'URL exacte de la file d'attente SQS"
  value       = aws_sqs_queue.ma_file.id
}