import i18n from "../i18n/i18n";
import Regex from "./Regex";
import libphonenumber from "google-libphonenumber";

class ValidationsClass {
  public get Required() {
    return {
      required: {
        value: true,
        message: i18n.t("validation.required"),
      },
    };
  }

  public get Mail() {
    return {
      pattern: {
        value: Regex.Mail,
        message: i18n.t("validation.pattern_invalid"),
      },
    };
  }

  public get Phone() {
    return this.Custom((number: string) => {
      try {
        const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
        if (number && !number.match(/^\+\d+ .+$/)) {
          return "validation.code_and_number";
        } else if (
          (number && !number.match(/^\+[\d ]*$/)) ||
          (number && !phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(number)))
        ) {
          return "validation.pattern_invalid";
        }

        return true;
      } catch (_) {
        return "validation.pattern_invalid";
      }
    });
  }

  public Custom = (validator: (value: any) => true | string) => ({
    validate: (val: any) => (typeof validator(val) == "boolean" ? validator(val) : i18n.t(validator(val) as string)),
  });
}

const Validations = new ValidationsClass();
export default Validations;
