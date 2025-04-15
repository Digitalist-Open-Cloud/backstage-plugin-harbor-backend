import { ConfigReader } from '@backstage/config'
import express from 'express'
import request from 'supertest'
import { createRouter } from './router'
import { mockVoidLogger } from './MockVoidLogger'

jest.mock('./artifact', () => ({
  getArtifacts: jest.fn().mockResolvedValue([
    {
      size: '567',
      tag: 'test-tag',
      pullTime: '2023-10-01T00:00:00Z',
      pushTime: '2023-10-01T00:00:00Z',
      projectID: 'proj123',
      repoUrl: 'http://foo.bar',
      vulnerabilities: [],
    },
  ]),
}))

jest.mock('./config', () => ({
  getHarborInstances: jest.requireActual('./config').getHarborInstances,
}))

describe('createRouter', () => {
  let app: express.Express

  beforeAll(async () => {
    const mockAuth = {
      getPluginRequestToken: jest.fn(),
      getLimitedUserToken: jest.fn(),
      authenticate: jest.fn(),
    }

    const mockHttpAuth = {
      credentials: jest.fn().mockReturnValue((_req, _res, next) => next()),
    }

    const router = await createRouter({
      logger: mockVoidLogger,
      config: new ConfigReader({
        harbor: {
          instances: [
            // 👈 ✅ explicit correct structure!
            {
              name: 'default',
              baseUrl: 'http://my-testing-harbor.local',
              host: 'https://my-test-harbor.example.com',
              username: 'testuser',
              password: 'testpass',
            },
          ],
        },
      }),
      auth: mockAuth,
      httpAuth: mockHttpAuth,
    })

    app = express().use(router)
  })

  it('returns artifact info successfully', async () => {
    const response = await request(app)
      .get('/artifacts')
      .query({ project: 'test', repository: 'testrepo' })

    // extra debug log, if it still somehow fails explicitly
    if (response.statusCode !== 200) {
      console.error('Explicitly Error:', response.body)
    }

    expect(response.statusCode).toEqual(200)
    expect(Array.isArray(response.body)).toBeTruthy()

    const art = response.body[0]
    expect(art).toHaveProperty('size', '567')
    expect(art).toHaveProperty('tag', 'test-tag')
    expect(art).toHaveProperty('pullTime', '2023-10-01T00:00:00Z')
    expect(art).toHaveProperty('pushTime', '2023-10-01T00:00:00Z')
    expect(art).toHaveProperty('projectID', 'proj123')
    expect(art).toHaveProperty('repoUrl', 'http://foo.bar')
  })
})
