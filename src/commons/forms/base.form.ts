import { useState } from "react";
import {
  FieldValues,
  useForm,
  UseFormProps
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type * as yup from "yup";

export interface BaseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues
> extends Omit<
  UseFormProps<TFieldValues, TContext, TTransformedValues>,
  "defaultValues"
> {
  schema?: yup.ObjectSchema<any>;
  defaultValues?: Partial<TFieldValues>;
}
const createForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues
>(
  props: BaseFormProps<TFieldValues, TContext, TTransformedValues>
) => {
  const { schema, defaultValues, ...formOptions } = props;

  const form = useForm<TFieldValues, TContext, TTransformedValues>({
    ...formOptions,
    defaultValues: defaultValues as any,
    resolver: schema ? yupResolver(schema) : undefined,
  });
  const [detailError, setDetailError] = useState("");

  const handleApiResponse = (error: any): string => {
    let errDetailMsg = "";
    const data = error?.response?.data;
    if (!data || typeof data !== "object") {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "Something went wrong. Please try again.";
      setDetailError(String(msg));
      return String(msg);
    }

    Object.keys(data).forEach((key: any) => {
      const errMsg = (data as any)[key];
      const msg = Array.isArray(errMsg) ? errMsg[0] : errMsg;
      const hasField =
        Object.prototype.hasOwnProperty.call(form.getValues() ?? {}, key);

      if (hasField) {
        form.setError(key as any, {
          type: "manual",
          message: String(msg),
        });
      } else {
        setDetailError(String(msg));
        errDetailMsg = String(msg);
      }
    });
    return errDetailMsg;
  };

  return { form, detailError, handleApiResponse, setDetailError };
};

export function baseForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues
>(props1: BaseFormProps<TFieldValues, TContext, TTransformedValues>) {
  return (props2?: BaseFormProps<TFieldValues, TContext, TTransformedValues>) =>
    createForm<TFieldValues, TContext, TTransformedValues>({
      ...props1,
      ...props2,
    });
}