"use client";

import React from "react";
import { inputClass, labelClass } from "@/components/Misc/Form/FormModal";

interface FieldShellProps {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}

function FieldShell({ label, required, children }: FieldShellProps) {
    return (
        <div>
            <label className={labelClass}>
                {label}
                {required ? " *" : ""}
            </label>
            {children}
        </div>
    );
}

interface TextFieldProps {
    name: string;
    label: string;
    required?: boolean;
    defaultValue?: string | number;
    placeholder?: string;
    type?: "text" | "number" | "datetime-local";
    min?: string | number;
}

export function TextField({
    name,
    label,
    required,
    defaultValue,
    placeholder,
    type = "text",
    min,
}: TextFieldProps) {
    return (
        <FieldShell label={label} required={required}>
            <input
                name={name}
                type={type}
                required={required}
                defaultValue={defaultValue}
                placeholder={placeholder}
                min={min}
                className={inputClass}
            />
        </FieldShell>
    );
}

interface TextareaFieldProps {
    name: string;
    label: string;
    rows?: number;
    defaultValue?: string;
    placeholder?: string;
}

export function TextareaField({
    name,
    label,
    rows = 2,
    defaultValue,
    placeholder,
}: TextareaFieldProps) {
    return (
        <FieldShell label={label}>
            <textarea
                name={name}
                rows={rows}
                defaultValue={defaultValue}
                placeholder={placeholder}
                className={inputClass}
            />
        </FieldShell>
    );
}

interface SelectFieldProps {
    name: string;
    label: string;
    required?: boolean;
    defaultValue?: string | number;
    children: React.ReactNode;
}

export function SelectField({
    name,
    label,
    required,
    defaultValue,
    children,
}: SelectFieldProps) {
    return (
        <FieldShell label={label} required={required}>
            <select
                name={name}
                required={required}
                defaultValue={defaultValue}
                className={inputClass}
            >
                {children}
            </select>
        </FieldShell>
    );
}

interface CheckboxFieldProps {
    name: string;
    label: string;
    defaultChecked?: boolean;
}

export function CheckboxField({
    name,
    label,
    defaultChecked,
}: CheckboxFieldProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                name={name}
                type="checkbox"
                id={name}
                defaultChecked={defaultChecked}
                className="rounded border-gray-300 dark:border-gray-600"
            />
            <label
                htmlFor={name}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {label}
            </label>
        </div>
    );
}

interface ColorFieldProps {
    name: string;
    label: string;
    required?: boolean;
    defaultValue?: string;
}

export function ColorField({
    name,
    label,
    required,
    defaultValue,
}: ColorFieldProps) {
    return (
        <FieldShell label={label} required={required}>
            <input
                name={name}
                type="color"
                required={required}
                defaultValue={defaultValue}
                className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-800 cursor-pointer"
            />
        </FieldShell>
    );
}
