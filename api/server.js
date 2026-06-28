const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const app = express();
app.use(express.json()); // Pour pouvoir lire le JSON envoyé dans les requêtes

// Configuration des clients AWS (qui pointent vers LocalStack grâce aux variables d'environnement)
const config = {
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: 'mock', secretAccessKey: 'mock' }
};

const s3 = new S3Client(config);
const sqs = new SQSClient(config);

// La route que l'utilisateur va appeler
app.post('/upload', async (req, res) => {
  const { filename, content } = req.body; // On attend un nom de fichier et du texte

  try {
    // 1. On envoie le fichier dans le bucket S3 local
    await s3.send(new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
      Body: content
    }));
    console.log(`[API] Fichier ${filename} sauvegardé dans S3.`);

    // 2. On envoie un ticket dans la file SQS pour prévenir le Worker
    await sqs.send(new SendMessageCommand({
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify({ file: filename, timestamp: Date.now() })
    }));
    console.log(`[API] Message envoyé dans SQS pour le fichier ${filename}.`);

    res.status(201).json({ message: "Fichier reçu et mis en file d'attente !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne" });
  }
});

app.listen(3000, () => console.log('🚀 API démarrée sur le port 3000'));