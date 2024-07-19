import { errorHandler } from '@backstage/backend-common'
import { Config } from '@backstage/config'
import express from 'express';
import Router from 'express-promise-router'
import { Logger } from 'winston'
import { getArtifacts } from './artifact'
import { repoSearch } from './search'
import { getTeamArtifacts } from './teamArtifacts'
import { getHarborInstances } from './config'

export interface RouterOptions {
  logger: Logger
  config: Config
}

export async function createRouter(
  options: RouterOptions
): Promise<express.Router> {
  const { logger, config } = options

  logger.info('Initializing harbor backend')
  const harborInstances = getHarborInstances(config)
  const redisConfig = config.getOptionalConfig('redis')

  const router = Router()
  router.use(express.json())

  router.get('/artifacts', async (request, response) => {
    const host: string = request.query.host as string ?? ''
    const project: string = request.query.project as string
    const repository: string = request.query.repository as string

    const artifacts = await getArtifacts(
      harborInstances,
      decodeURIComponent(host),
      project,
      decodeURIComponent(repository)
    )

    response.send(artifacts)
  })

  router.post('/teamartifacts', async (request, response) => {
    const team: any = request.query.team
    const componentType: any = request.query.type
    const artifacts = await getTeamArtifacts(
      request.body,
      team,
      componentType,
      redisConfig
    )

    response.send(artifacts)
  })

  router.post('/search', async (request, response) => {
    const host: string = request.query.host as string ?? ''
    const team: any = request.query.team
    const search = await repoSearch(
      harborInstances,
      host,
      request.body,
      team,
      redisConfig
    )

    response.send(search)
  })

  router.get('/health', (_, response) => {
    response.send({ status: 'ok' })
  })
  router.use(errorHandler())
  return router
}
