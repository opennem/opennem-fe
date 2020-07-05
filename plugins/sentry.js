import Vue from 'vue'
import * as Sentry from '@sentry/browser'
import { Vue as VueIntegration } from '@sentry/integrations'

const host = window.location.host
if (host === 'opennem.org.au') {
  Sentry.init({
    dsn:
      'https://c89c945a3c14478f9df55a65ddb1fbae@o402615.ingest.sentry.io/5265226',
    integrations: [new VueIntegration({ Vue, attachProps: true })]
  })
}
