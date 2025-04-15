jest.mock('node-fetch', () => jest.fn())

const mockRedisClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  expire: jest.fn().mockResolvedValue(true),
}
jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient),
}))

jest.mock('./config', () => ({
  getCurrentHarborInstance: jest.fn(),
}))

import { ConfigReader } from '@backstage/config'
import { repoSearch } from './search'
import { getCurrentHarborInstance } from './config'
import fetch from 'node-fetch'

const { Response } = jest.requireActual('node-fetch')

describe('repoSearch', () => {
  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  const mockedGetCurrentHarborInstance =
    getCurrentHarborInstance as jest.MockedFunction<
      typeof getCurrentHarborInstance
    >

  beforeEach(() => {
    jest.clearAllMocks()

    mockedGetCurrentHarborInstance.mockReturnValue({
      host: 'https://test-harbor.local',
      apiBaseUrl: 'https://test-harbor.local/api',
      username: 'testuser',
      password: 'testpass',
    })

    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          repository: [
            { project_name: 'test-project', repository_name: 'repo/testrepo' },
          ],
        })
      )
    )

    mockRedisClient.get.mockResolvedValue(null)
  })

  it('returns repos successfully and caches results explicitly clearly', async () => {
    const harborInstances = [
      {
        host: 'https://test-harbor.local',
        apiBaseUrl: 'https://test-harbor.local/api',
        username: 'testuser',
        password: 'testpass',
      },
    ]
    const redisConfig = new ConfigReader({ host: 'localhost', port: 6379 })
    const repos = [{ repository: 'testrepo' }]

    const result = await repoSearch(
      harborInstances,
      'https://test-harbor.local',
      JSON.stringify(repos),
      'my-team',
      redisConfig
    )

    expect(result).toEqual([
      { project: 'test-project', repository: 'testrepo' },
    ])

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://test-harbor.local/api/api/v2.0/search?q=testrepo',
      expect.any(Object)
    )

    expect(mockRedisClient.connect).toHaveBeenCalled()
    expect(mockRedisClient.get).toHaveBeenCalledWith('my-team')
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'my-team',
      JSON.stringify([{ project: 'test-project', repository: 'testrepo' }])
    )
    expect(mockRedisClient.expire).toHaveBeenCalledWith('my-team', 3600)
  })

  it('returns cached response from Redis explicitly clearly', async () => {
    mockRedisClient.get.mockResolvedValue(
      JSON.stringify([{ project: 'cached-project', repository: 'cachedrepo' }])
    )

    const harborInstances = [
      {
        host: 'https://test-harbor.local',
        apiBaseUrl: 'https://test-harbor.local/api',
        username: 'testuser',
        password: 'testpass',
      },
    ]
    const redisConfig = new ConfigReader({ host: 'localhost', port: 6379 })
    const repos = [{ repository: 'testrepo' }]

    const result = await repoSearch(
      harborInstances,
      'https://test-harbor.local',
      JSON.stringify(repos),
      'my-team',
      redisConfig
    )

    expect(result).toEqual([
      { project: 'cached-project', repository: 'cachedrepo' },
    ])

    expect(mockRedisClient.get).toHaveBeenCalledWith('my-team')
    expect(mockedFetch).not.toHaveBeenCalled()
  })
})
