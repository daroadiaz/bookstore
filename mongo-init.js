db = db.getSiblingDB('admin');

db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [
    { role: 'root', db: 'admin' }
  ]
});

db = db.getSiblingDB('bookstore_db');

db.createCollection('books');
db.createCollection('searches');
db.createCollection('users');

db.books.insertOne({
  title: 'Libro de Ejemplo',
  author: 'Autor de Prueba',
  isbn: '1234567890',
  publishedDate: new Date(),
  description: 'Este es un libro de prueba para verificar que la base de datos funciona correctamente',
  thumbnail: 'https://via.placeholder.com/128x195',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Base de datos inicializada correctamente');
print('Colecciones creadas: books, searches, users');
print('Usuario admin creado con contraseña: admin123');