import { XMLParser } from 'fast-xml-parser'
import { NumberCondition, Rule, StringCondition } from '../types/rules'

export type ValidationError = {
  path: string
  message: string
  value?: any
}

export type ValidationResult = {
  isValid: boolean
  errors: ValidationError[]
}

export function validateXml(xml: string, rules: Rule[]): ValidationResult {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })

  let jsonObj
  try {
    jsonObj = parser.parse(xml)
  } catch (e) {
    return {
      isValid: false,
      errors: [
        {
          path: 'XML',
          message: 'Invalid XML format',
          value: undefined,
        },
      ],
    }
  }

  const errors: ValidationError[] = []

  for (const rule of rules) {
    const value = getValueByPath(jsonObj, rule.path)

    // Check required
    if (value === undefined || value === null || value === '') {
      if (rule.required) {
        errors.push({
          path: rule.path,
          message: 'Missing required field',
          value: value,
        })
      }
      continue // Skip further validation if missing (unless required, which is already handled)
    }

    // Check data type and conditions
    const typeError = validateType(value, rule.dataType)
    if (typeError) {
      errors.push({
        path: rule.path,
        message: typeError,
        value: value,
      })
      continue
    }

    const conditionError = validateCondition(
      value,
      rule.dataType,
      rule.condition
    )
    if (conditionError) {
      errors.push({
        path: rule.path,
        message: conditionError,
        value: value,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function getValueByPath(obj: any, path: string): any {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined
    }
    current = current[part]
  }
  return current
}

function validateType(value: any, dataType: string): string | null {
  switch (dataType) {
    case 'string':
      return typeof value === 'string' || typeof value === 'number' // XML parser might parse numbers as numbers
        ? null
        : 'Expected string'
    case 'number':
      return !isNaN(Number(value)) ? null : 'Expected number'
    case 'boolean':
      return value === true ||
        value === false ||
        value === 'true' ||
        value === 'false'
        ? null
        : 'Expected boolean'
    case 'object':
      return typeof value === 'object' && !Array.isArray(value)
        ? null
        : 'Expected object'
    case 'array':
      return Array.isArray(value) ? null : 'Expected array'
    default:
      return null
  }
}

function validateCondition(
  value: any,
  dataType: string,
  condition: any
): string | null {
  if (!condition || Object.keys(condition).length === 0) return null

  if (dataType === 'string') {
    const strVal = String(value)
    const cond = condition as StringCondition

    if (cond.minLength !== undefined && strVal.length < cond.minLength) {
      return `Length must be at least ${cond.minLength}`
    }
    if (cond.maxLength !== undefined && strVal.length > cond.maxLength) {
      return `Length must be at most ${cond.maxLength}`
    }
    if (cond.pattern) {
      try {
        const regex = new RegExp(cond.pattern)
        if (!regex.test(strVal)) {
          return `Value does not match pattern ${cond.pattern}`
        }
      } catch (e) {
        console.error('Invalid regex pattern:', cond.pattern)
      }
    }
    if (cond.allowEmpty === false && strVal.trim() === '') {
      return 'Value cannot be empty'
    }
  } else if (dataType === 'number') {
    const numVal = Number(value)
    const cond = condition as NumberCondition

    if (cond.min !== undefined && numVal < cond.min) {
      return `Value must be at least ${cond.min}`
    }
    if (cond.max !== undefined && numVal > cond.max) {
      return `Value must be at most ${cond.max}`
    }
  }

  return null
}
