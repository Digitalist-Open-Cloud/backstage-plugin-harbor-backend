import { getVoidLogger } from '@backstage/backend-common'
import { ConfigReader } from '@backstage/config'
import express from 'express'
import request from 'supertest'
import { createRouter } from './router'

describe('createRouter', () => {
  let app: express.Express

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: new ConfigReader({
        harbor: {
          baseUrl: process.env.APP_CONFIG_harbor_baseUrl,
          username: process.env.APP_CONFIG_harbor_username,
          password: process.env.APP_CONFIG_harbor_password,
        },
      }),
    })
    app = express().use(router)
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toEqual(200)
      expect(response.body).toEqual({ status: 'ok' })
    })
  })
})
