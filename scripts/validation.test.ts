import { validateXml } from "../src/app/lib/validation/xml-validator";
import { Rule } from "../src/app/lib/types/rules";

const rules: Rule[] = [
  {
    id: 1,
    name: "User Name",
    path: "user.name",
    dataType: "string",
    required: true,
    condition: { minLength: 3 },
    projectId: "p1",
    createdAt: new Date(),
    description: null,
    parentId: null,
    globalRuleId: null,
  },
  {
    id: 2,
    name: "User Age",
    path: "user.age",
    dataType: "number",
    required: true,
    condition: { min: 18 },
    projectId: "p1",
    createdAt: new Date(),
    description: null,
    parentId: null,
    globalRuleId: null,
  },
];

const validXml = `
<user>
  <name>John Doe</name>
  <age>25</age>
</user>
`;

const invalidXml = `
<user>
  <name>Jo</name>
  <age>15</age>
</user>
`;

console.log("Testing Valid XML...");
const validResult = validateXml(validXml, rules);
console.log("Valid Result:", validResult);

console.log("\nTesting Invalid XML...");
const invalidResult = validateXml(invalidXml, rules);
console.log("Invalid Result:", invalidResult);

if (validResult.isValid && !invalidResult.isValid && invalidResult.errors.length === 2) {
  console.log("\n✅ Verification Passed!");
} else {
  console.error("\n❌ Verification Failed!");
  process.exit(1);
}
