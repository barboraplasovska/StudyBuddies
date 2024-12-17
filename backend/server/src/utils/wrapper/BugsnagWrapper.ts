import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import { HttpError } from "utils/errors/HttpError";

class BugsnagWrapper {
  start() {
      Bugsnag.start({
          apiKey: process.env.BUGSNAG_API_KEY!,
          plugins: [BugsnagPluginExpress]
      });
  }

  notify(error: HttpError) {
      Bugsnag.notify(error);
  }

  getPlugin() {
      return Bugsnag.getPlugin('express');
  }
}

export default BugsnagWrapper;