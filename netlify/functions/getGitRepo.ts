import { Handler } from '@netlify/functions'
import fetch from 'node-fetch'

import { Client, Entity, Schema } from 'redis-om'

class Activity extends Entity {}

let schema = new Schema(Activity, {
  userId: { type: 'string' },
  taskId: { type: 'string' },
})

const client = new Client()

async function getRepository() {
  try {
    if (!client.isOpen()) {
      const result = await client.open(
        'redis://' + process.env.REDIS_OM_URL ?? 'redis://localhost:6379'
      )
    }

    const repository = client.fetchRepository(schema)
    //   await repository.createIndex();
    return repository
  } catch (error) {
    console.log('error: ', error)
  }
}

async function findInCache(name) {
  const repository = await getRepository()
  return false
  return repository
    .search()
    .where('login')
    .equals(name)
    .return.first()
}

async function storeInCache(data) {
  const repository = await getRepository()

  let repo = repository.createEntity()
  repo.login = data.login
  repo.url = data.url
  repo.avatar_url = data.avatar_url
  repo.type = data.type
  repo.public_repos = data.public_repos
  repo.followers = data.followers
  repo.following = data.following
  repo.time = data.time

  await repository.save(repo)

  return repo
}

export async function getActivity(name) {
  const start = Date.now()
  const repo = await findInCache(name)

  if (repo) {
    return {
      repo: repo.toJSON(),
      cached: true,
      time: Date.now() - start,
    }
  }

  const url = `https://api.github.com/users/${name}`

  const response = await fetch(url)
  console.log('🚀 ~ file: getActivity.ts ~ line 82 ~ getActivity ~ response', response)
  let data = await response.json()

  if (!!data) {
    data.time = Date.now() - start
    data = await storeInCache(data)
  }

  return {
    repo: data,
    cached: false,
    time: data.time,
  }
}

const handler: Handler = async (event, context) => {
  console.log(event.queryStringParameters)
  const body = await getActivity(event.queryStringParameters.name)
  console.log('body', body)
  // if (body){
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' }),
  }
  // }
}
export { handler }
