import express from 'express'
import { Config } from '@backstage/config'
import Router from 'express-promise-router'
import {
  LoggerService,
  AuthService,
  HttpAuthService,
} from '@backstage/backend-plugin-api'
import { getArtifacts } from './artifact'
import { repoSearch } from './search'
import { getHarborInstances } from './config'

export interface RouterOptions {
  logger: LoggerService
  config: Config
  auth: AuthService
  httpAuth: HttpAuthService
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
    try {
      const host: string = (request.query.host as string) ?? ''
      const project: string = request.query.project as string
      const repository: string = request.query.repository as string

      const artifacts = await getArtifacts(
        harborInstances,
        decodeURIComponent(host),
        project,
        decodeURIComponent(repository)
      )

      response.send(artifacts)
    } catch (error) {
      console.error('Error in /artifacts handler:', error)
      response.status(500).json({ error: (error as Error).message })
    }
  })

  router.post('/search', async (request, response) => {
    const host: string = (request.query.host as string) ?? ''
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
  return router
}
