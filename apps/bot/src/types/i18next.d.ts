import "i18next";
import resources from "./resources.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translations";
    resources: typeof resources;
    enableSelector: "optimize";
  }
}
