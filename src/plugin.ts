import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * Harbor backend plugin
 *
 * @public
 */
export const harborBackendPlugin = createBackendPlugin({
  pluginId: 'harbor',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
      },
      async init({ httpRouter, logger, config, auth, httpAuth }) {
        logger.info('Harbor backend plugin is running');
        const router = await createRouter({ config, logger, auth, httpAuth });
        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });

      },
    });
  },
});