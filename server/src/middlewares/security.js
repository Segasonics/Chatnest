import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

export function applySecurity(app) {
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
    })
  );
  app.use(mongoSanitize());
  app.use(hpp());
}
