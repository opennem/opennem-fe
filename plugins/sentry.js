import Vue from 'vue'

import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

if (typeof window !== 'undefined') {
  const host = window.location.host
  if (host === 'opennem.org.au') {
    Sentry.init({
      Vue,
      dsn:
        'https://c89c945a3c14478f9df55a65ddb1fbae@o402615.ingest.sentry.io/5265226',
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
          tracingOrigins: [
            'localhost',
            'opennem.org.au',
            'dev.opennem.org.au',
            /^\//
          ]
        })
      ],
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0
    })
  }
}
