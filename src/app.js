const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function chooseNotEmptyValue(value1, value2) {
  return value1 ? value1 : value2;
}

function repositoryExists(request, response, next) {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if (!isUuid(id) || repoIndex < 0) {
    return response.status(400).json({
      error: `Repository with ID "${id}" does not exists`
    });
  }

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", repositoryExists, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  const repository = repositories[repoIndex];
  const newRepository = {
    id,
    title: chooseNotEmptyValue(title, repository.title),
    url: chooseNotEmptyValue(url, repository.url),
    techs: chooseNotEmptyValue(techs, repository.techs),
    likes: repository.likes
  };

  repositories[repoIndex] = newRepository;

  return response.json(newRepository);
});

app.delete("/repositories/:id", repositoryExists, (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", repositoryExists, (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  const repository = repositories[repoIndex];

  repositories[repoIndex] = {
    ...repository,
    likes: repository.likes + 1
  }

  return response.json(repositories[repoIndex]);
});

module.exports = app;
