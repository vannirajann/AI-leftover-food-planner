# Public Demo Deployment

The app can be deployed as one Docker web service. The GitHub repository may stay private; the hosted website is public so friends can open its URL without GitHub access.

## Deploy with Render

1. Sign in to Render and choose **New** > **Blueprint**.
2. Connect GitHub and authorize Render to read `vannirajann/AI-leftover-food-planner`.
3. Select the repository and deploy the `render.yaml` blueprint.
4. Wait for the service health check to pass, then share its `onrender.com` URL.
5. Sign in to the demo app with `demo@leftover.ai` and `Demo123!`.

Render generates a JWT secret for the service. The default container intentionally uses the manual food-confirmation and text-date demo flows; image-processing, TensorFlow, and EasyOCR packages are optional and are not installed in the hosted image.

The free web service may sleep while idle, so the first visit after a pause can take longer. Its SQLite database is stored in the container and may reset after a redeploy or restart. Use only the seeded demo account and avoid entering real personal data.