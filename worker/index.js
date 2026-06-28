const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

const config = {
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  credentials: { accessKeyId: 'mock', secretAccessKey: 'mock' }
};

const sqs = new SQSClient(config);

async function listenToQueue() {
  console.log("[Worker] À l'écoute de la file d'attente SQS...");

  while (true) { // Boucle infinie
    try {
      // On demande s'il y a un message dans la file (Long Polling de 5 secondes)
      const data = await sqs.send(new ReceiveMessageCommand({
        QueueUrl: process.env.QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 5
      }));

      if (data.Messages && data.Messages.length > 0) {
        const message = data.Messages[0];
        const body = JSON.parse(message.Body);
        
        console.log(`\n🔥 [Worker] Nouveau fichier détecté : ${body.file}`);
        console.log("[Worker] Début du traitement lourd (Simulation de 3 secondes)...");
        
        // On simule un traitement de 3 secondes
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log(`✅ [Worker] Traitement terminé pour ${body.file} !`);

        // TRÈS IMPORTANT : On supprime le message de la file pour ne pas le retraiter
        await sqs.send(new DeleteMessageCommand({
          QueueUrl: process.env.QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle
        }));
      }
    } catch (error) {
      console.error("[Worker] Erreur lors de la lecture de la file :", error);
      await new Promise(resolve => setTimeout(resolve, 5000)); // On attend avant de réessayer
    }
  }
}

// On lance le Worker après un petit délai pour laisser LocalStack démarrer tranquillement
setTimeout(listenToQueue, 10000);