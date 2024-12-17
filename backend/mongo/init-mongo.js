// Connexion à la base de données
const db = connect("mongodb://127.0.0.1:27017/studybuddies");

// Nom de la collection
const collectionName = "messages";

// Vérification si la collection existe déjà et suppression pour réinitialisation
if (db.getCollectionNames().includes(collectionName)) {
  db[collectionName].drop();
  print(`Collection '${collectionName}' supprimée.`);
}

// Documents mockés pour initialisation
const mockMessages = [
  {
    senderId: "1",
    roomId: "4",
    content: "Salut tout le monde !",
    createdAt: new Date("2024-09-01T07:28:16Z"),
    updatedAt: new Date("2024-09-01T07:28:16Z"),
  },
  {
    senderId: "2",
    roomId: "4",
    content: "Salut polo !",
    createdAt: new Date("2024-09-01T07:30:36Z"),
    updatedAt: new Date("2024-09-01T07:30:36Z"),
  },
  {
    senderId: "4",
    roomId: "4",
    content: "Vous avez avancé sur le projet de backend ?",
    createdAt: new Date("2024-09-01T09:15:00Z"),
    updatedAt: new Date("2024-09-01T09:15:00Z"),
  },
  {
    senderId: "1",
    roomId: "4",
    content: "Pas encore, je galère à configurer RabbitMQ avec Serilog...",
    createdAt: new Date("2024-09-01T09:30:00Z"),
    updatedAt: new Date("2024-09-01T09:30:00Z"),
  },
  {
    senderId: "3",
    roomId: "4",
    content: "Moi j'ai fini la partie MassTransit hier, je peux t'aider si tu veux.",
    createdAt: new Date("2024-09-01T10:00:00Z"),
    updatedAt: new Date("2024-09-01T10:00:00Z"),
  },
  {
    senderId: "2",
    roomId: "4",
    content: "Sinon, pour l'examen de jeudi, vous révisez quoi en priorité ?",
    createdAt: new Date("2024-09-02T14:00:00Z"),
    updatedAt: new Date("2024-09-02T14:00:00Z"),
  },
  {
    senderId: "4",
    roomId: "4",
    content: "Les cours sur les microservices ! J'ai vu qu'il y avait des questions sur la différence entre REST et gRPC.",
    createdAt: new Date("2024-09-02T14:10:00Z"),
    updatedAt: new Date("2024-09-02T14:10:00Z"),
  },
  {
    senderId: "1",
    roomId: "4",
    content: "J'avais oublié cet examen 😅 Merci pour le rappel, je vais m'y mettre !",
    createdAt: new Date("2024-09-02T14:15:00Z"),
    updatedAt: new Date("2024-09-02T14:15:00Z"),
  },
  {
    senderId: "3",
    roomId: "4",
    content: "Pas de souci, n'hésitez pas si vous voulez qu'on fasse un point tous ensemble avant jeudi.",
    createdAt: new Date("2024-09-02T15:00:00Z"),
    updatedAt: new Date("2024-09-02T15:00:00Z"),
  },
  {
    senderId: "2",
    roomId: "4",
    content: "Bonne idée, on peut se caler ça demain après-midi ?",
    createdAt: new Date("2024-09-02T15:30:00Z"),
    updatedAt: new Date("2024-09-02T15:30:00Z"),
  },
  {
    senderId: "4",
    roomId: "4",
    content: "Oui, parfait pour moi. 16h ça vous va ?",
    createdAt: new Date("2024-09-02T15:40:00Z"),
    updatedAt: new Date("2024-09-02T15:40:00Z"),
  },
  {
    senderId: "1",
    roomId: "4",
    content: "Ça marche, je prépare des questions sur les patterns d'architecture.",
    createdAt: new Date("2024-09-02T15:45:00Z"),
    updatedAt: new Date("2024-09-02T15:45:00Z"),
  },
  {
    senderId: "3",
    roomId: "4",
    content: "Vous avez regardé l'exemple de code sur le repo partagé ? Je pense qu'il y a une erreur dans la config des endpoints gRPC.",
    createdAt: new Date("2024-09-03T10:00:00Z"),
    updatedAt: new Date("2024-09-03T10:00:00Z"),
  },
  {
    senderId: "1",
    roomId: "4",
    content: "Oui, je l'ai corrigée ce matin. Il manquait une ligne pour activer le protocole HTTP/2.",
    createdAt: new Date("2024-09-03T10:15:00Z"),
    updatedAt: new Date("2024-09-03T10:15:00Z"),
  },
  {
    senderId: "2",
    roomId: "4",
    content: "Top, merci ! Je vais tester ça tout à l'heure.",
    createdAt: new Date("2024-09-03T10:20:00Z"),
    updatedAt: new Date("2024-09-03T10:20:00Z"),
  },
  {
    senderId: "4",
    roomId: "4",
    content: "D'ailleurs, vous pensez qu'ils vont poser des questions sur les API Gateway ?",
    createdAt: new Date("2024-09-03T11:00:00Z"),
    updatedAt: new Date("2024-09-03T11:00:00Z"),
  },
  {
    senderId: "3",
    roomId: "4",
    content: "Probablement, c'était au programme. Ocelot est souvent cité dans les cours.",
    createdAt: new Date("2024-09-03T11:10:00Z"),
    updatedAt: new Date("2024-09-03T11:10:00Z"),
  },
  {
    senderId: "3",
    roomId: "3",
    content: "T'as bien avancé sur la feature ?",
    createdAt: new Date("2025-07-24T10:00:00Z"),
    updatedAt: new Date("2025-07-24T10:00:00Z"),
  },
  {
    senderId: "2",
    roomId: "3",
    content: "Yes ! Mais je galère pas mal avec le refacto du service ;(",
    createdAt: new Date("2025-07-24T11:00:00Z"),
    updatedAt: new Date("2025-07-24T11:00:00Z"),
  },
  {
    senderId: "3",
    roomId: "3",
    content: "Ouais c'est dur, mais faut vraiment qu'on réussise à le faire",
    createdAt: new Date("2025-07-24T11:01:00Z"),
    updatedAt: new Date("2025-07-24T11:01:00Z"),
  },
];

// Création de la collection et insertion des documents
db.createCollection(collectionName);
db[collectionName].insertMany(mockMessages);

print(
  `Collection '${collectionName}' initialisée avec ${mockMessages.length} documents.`,
);
