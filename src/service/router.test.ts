import { ConfigReader } from '@backstage/config'
import express from 'express'
import request from 'supertest'
import { createRouter } from './router'
import { mockVoidLogger } from './MockVoidLogger';

describe('createRouter', () => {
  let app: express.Express

  beforeAll(async () => {
    const router = await createRouter({
      logger: mockVoidLogger,
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
