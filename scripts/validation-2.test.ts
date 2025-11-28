import { Rule } from '../src/app/lib/types/rules'
import { validateXml } from '../src/app/lib/validation/xml-validator'

const rules: Rule[] = [
  {
    id: 1,
    name: 'User Name',
    path: 'user.name',
    dataType: 'string',
    required: true,
    condition: {},
    projectId: 'p1',
    createdAt: new Date(),
    description: null,
    parentId: null,
    globalRuleId: null,
  },
]

const xml = `<product><id>1</id></product>`

console.log('Testing with XML:', xml)
console.log('Rules:', JSON.stringify(rules, null, 2))

const result = validateXml(xml, rules)

console.log('Result:', JSON.stringify(result, null, 2))
