# Backstage Harbor Backend plugin

This plugin will show information about your docker images within Harbor.

This is a fork, and no promises for backwards compatibility. But have been tested on Backstage 1.29.x (version 0.4.2 of this plugin) and 1.37.x (0.6.0).

For the original code, please see the [GitHub repo](https://github.com/container-registry/backstage-plugin-harbor-backend)

## Getting started

First [install frontend](https://github.com/Digitalist-Open-Cloud/backstage-plugin-harbor)

### Enabling backend

### Backend

```bash
yarn --cwd packages/backend add @digitalist-open-cloud/backstage-plugin-harbor-backend
```

Add to `packages/backend/src/index.ts`:

```ts
backend.add(import('@digitalist-open-cloud/backstage-plugin-harbor-backend'))
```

Now, jump to configuration step.

## Configuration

The plugin requires configuration in the Backstage app-config.yaml to connect to Harbor API.

```yaml
harbor:
  # This is the traditional way of configuring the Harbor plugin.
  baseUrl: https://harbor.yourdomain.com
  username: ${HARBOR_USERNAME}
  password: ${HARBOR_PASSWORD}

  # This is the way to go if you need to connect to multiple Harbor instances. You can also combine those approaches.
  instances:
    - host: harbor2.yourdomain.com
      baseUrl: https://harbor2.yourdomain.com
      username: ${HARBOR_USERNAME}
      password: ${HARBOR_PASSWORD}
```

Adding annotations and values to your component file.

```yaml
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: sample-system
  description: "A sample system"
  annotations:
    # This will use harbor.baseUrl
    goharbor.io/repository-slug: project/repository
    # OR
    # This will use harbor.instances[].baseUrl based on the matching host
    goharbor.io/repository-slug: harbor.yourdomain.com/project/repository
    # OR
    # This will fetch the first image from harbor.baseUrl and the second image from harbor.instances[].baseUrl
    goharbor.io/repository-slug: project/repository, harbor.yourdomain.com/project/repository
```

## Contributing

Please contribute back to the [original repo](https://github.com/container-registry/), and you are free to use any code from this repo to contribute back to the original repo without giving us credit.

## History

This Backstage plugin was initially created by [BESTSELLER](https://github.com/BESTSELLER) and transferred to [Container Registry](https://github.com/container-registry/). This fork was started because of an acute need, and to keep code up to date with Backstage.
