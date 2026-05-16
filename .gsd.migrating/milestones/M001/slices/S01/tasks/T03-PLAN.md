---
estimated_steps: 6
estimated_files: 3
skills_used: []
---

# T03: Verify clean build with ng build

Why: TypeScript --noEmit only checks types; a full Angular build additionally validates template bindings, module resolution, and AOT compilation. This task is the final gate ensuring no downstream import or template issue was introduced by T01/T02.

Do:
1. Run `ng build` from the project root.
2. Confirm exit code 0 and zero error lines.
3. If errors appear, fix them in the files from T01/T02 before marking complete.

Done when: `ng build` exits 0 with no error output.

## Inputs

- `src/app/services/items-service/item-names.ts`
- `src/app/services/items-service/items-data.ts`
- `src/app/services/trainer-service/pokemon-mega-forms.ts`

## Expected Output

- Update the implementation and proof artifacts needed for this task.

## Verification

npx ng build --project pokemon-roulette 2>&1 | grep -c "Error"
