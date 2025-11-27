/**
 * Ejemplos de código en múltiples lenguajes para la documentación API
 * Estos ejemplos se integran automáticamente en Scalar
 */

export const codeExamples = {
  // Ejemplo de registro de usuario
  registerUser: {
    javascript: `// Usando fetch API
const response = await fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'Password123!',
    rol: 'user'
  })
});

const data = await response.json();
console.log(data);`,

    typescript: `// Usando fetch con TypeScript
interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'editor' | 'user';
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function registerUser(userData: CreateUserDto) {
  const response = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const result: ApiResponse<User> = await response.json();
  return result;
}`,

    python: `# Usando requests
import requests

url = 'http://localhost:3000/api/users'
data = {
    'nombre': 'Juan Pérez',
    'email': 'juan@example.com',
    'password': 'Password123!',
    'rol': 'user'
}

response = requests.post(url, json=data)
print(response.json())`,

    curl: `curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "Password123!",
    "rol": "user"
  }'`,

    php: `<?php
// Usando cURL
$url = 'http://localhost:3000/api/users';
$data = [
    'nombre' => 'Juan Pérez',
    'email' => 'juan@example.com',
    'password' => 'Password123!',
    'rol' => 'user'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`,

    java: `// Usando HttpClient (Java 11+)
import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();

String json = """
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "rol": "user"
}
""";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:3000/api/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());
    
System.out.println(response.body());`,

    csharp: `// Usando HttpClient en C#
using System.Net.Http;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
var userData = new
{
    nombre = "Juan Pérez",
    email = "juan@example.com",
    password = "Password123!",
    rol = "user"
};

var json = JsonSerializer.Serialize(userData);
var content = new StringContent(json, Encoding.UTF8, "application/json");

var response = await client.PostAsync(
    "http://localhost:3000/api/users", 
    content
);

var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`,

    go: `// Usando net/http en Go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    url := "http://localhost:3000/api/users"
    
    data := map[string]string{
        "nombre":   "Juan Pérez",
        "email":    "juan@example.com",
        "password": "Password123!",
        "rol":      "user",
    }
    
    jsonData, _ := json.Marshal(data)
    
    resp, err := http.Post(url, "application/json", 
        bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    fmt.Println(result)
}`,

    ruby: `# Usando Net::HTTP en Ruby
require 'net/http'
require 'json'

uri = URI('http://localhost:3000/api/users')
http = Net::HTTP.new(uri.host, uri.port)

request = Net::HTTP::Post.new(uri.path)
request['Content-Type'] = 'application/json'
request.body = {
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'Password123!',
  rol: 'user'
}.to_json

response = http.request(request)
puts JSON.parse(response.body)`
  },

  // Ejemplo de login
  login: {
    javascript: `// Login y guardar token
const response = await fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'juan@example.com',
    password: 'Password123!'
  })
});

const { data } = await response.json();
// Guardar token para futuras peticiones
localStorage.setItem('token', data.token);
console.log('Token:', data.token);`,

    typescript: `// Login con TypeScript
interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

async function login(credentials: LoginDto): Promise<AuthResponse> {
  const response = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  const result = await response.json();
  
  if (result.success) {
    // Guardar token en localStorage
    localStorage.setItem('authToken', result.data.token);
    return result.data;
  }
  
  throw new Error(result.message);
}`,

    python: `# Login con Python
import requests

url = 'http://localhost:3000/api/users/login'
credentials = {
    'email': 'juan@example.com',
    'password': 'Password123!'
}

response = requests.post(url, json=credentials)
result = response.json()

if result['success']:
    token = result['data']['token']
    print(f'Token: {token}')
    # Guardar token para futuras peticiones
    with open('token.txt', 'w') as f:
        f.write(token)`,

    curl: `# Login y extraer token con jq
curl -X POST http://localhost:3000/api/users/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "juan@example.com",
    "password": "Password123!"
  }' | jq -r '.data.token'`
  },

  // Ejemplo de petición autenticada
  getProducts: {
    javascript: `// Obtener productos con autenticación
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/products?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
});

const { data } = await response.json();
console.log('Productos:', data);`,

    typescript: `// Obtener productos con TypeScript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function getProducts(
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResponse<Product>> {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(
    \`http://localhost:3000/api/products?page=\${page}&limit=\${limit}\`,
    {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    }
  );

  const result = await response.json();
  return result.data;
}`,

    python: `# Obtener productos con Python
import requests

# Leer token guardado
with open('token.txt', 'r') as f:
    token = f.read().strip()

url = 'http://localhost:3000/api/products'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
params = {
    'page': 1,
    'limit': 10
}

response = requests.get(url, headers=headers, params=params)
products = response.json()['data']
print(f"Total productos: {products['total']}")
for product in products['items']:
    print(f"- {product['name']}: \${product['price']}")`,

    curl: `# Obtener productos con token
TOKEN="tu_token_jwt_aqui"

curl -X GET "http://localhost:3000/api/products?page=1&limit=10" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json"`
  },

  // Ejemplo de crear producto con imagen
  createProduct: {
    javascript: `// Crear producto con imagen
const token = localStorage.getItem('token');
const formData = new FormData();

// Agregar datos del producto
formData.append('name', 'Laptop HP');
formData.append('description', 'Laptop HP 15.6" Intel Core i5');
formData.append('price', '15999.99');
formData.append('stock', '10');
formData.append('categoryId', 'uuid-de-categoria');

// Agregar imagen
const fileInput = document.querySelector('#imageInput');
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`
    // NO incluir Content-Type, el navegador lo establece automáticamente con boundary
  },
  body: formData
});

const result = await response.json();
console.log('Producto creado:', result.data);`,

    python: `# Crear producto con imagen en Python
import requests

with open('token.txt', 'r') as f:
    token = f.read().strip()

url = 'http://localhost:3000/api/products'
headers = {
    'Authorization': f'Bearer {token}'
}

# Datos del producto
data = {
    'name': 'Laptop HP',
    'description': 'Laptop HP 15.6" Intel Core i5',
    'price': '15999.99',
    'stock': '10',
    'categoryId': 'uuid-de-categoria'
}

# Archivo de imagen
files = {
    'image': open('laptop.jpg', 'rb')
}

response = requests.post(url, headers=headers, data=data, files=files)
result = response.json()
print('Producto creado:', result['data'])`,

    curl: `# Crear producto con imagen usando curl
curl -X POST http://localhost:3000/api/products \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "name=Laptop HP" \\
  -F "description=Laptop HP 15.6\\" Intel Core i5" \\
  -F "price=15999.99" \\
  -F "stock=10" \\
  -F "categoryId=uuid-de-categoria" \\
  -F "image=@laptop.jpg"`
  }
};

export default codeExamples;
