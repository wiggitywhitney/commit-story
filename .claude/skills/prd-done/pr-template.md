# Pull Request Template

Use this template when creating PRs with `gh pr create`.

## Format

```markdown
## Description

**What does this PR do?**
[Provide a clear and concise description of your changes]

**Why is this change needed?**
[Explain the motivation and context]

## Related Issues

- Closes #[issue-number]
- PRD: [link to PRD file]

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Test updates
- [ ] Configuration changes

## Testing Checklist

- [ ] Tests added or updated
- [ ] All existing tests pass locally
- [ ] Manual testing performed

**Test commands run:**
```bash
# Commands you ran locally to verify your changes
```

## Documentation Checklist

- [ ] README.md updated (if user-facing changes)
- [ ] Code comments added for complex logic
- [ ] API documentation updated (if API changes)

## Security Checklist

- [ ] No secrets or credentials committed
- [ ] Input validation implemented where needed
- [ ] Error messages don't leak sensitive information

## Checklist

- [ ] My code follows the project's code style guidelines
- [ ] I have performed a self-review of my code
- [ ] My changes generate no new warnings or errors
- [ ] New and existing tests pass locally with my changes
```

## Usage

When creating a PR, use this format with `gh pr create`:

```bash
gh pr create --title "feat(prd-X): brief description" --body "$(cat <<'EOF'
[paste template content here, filled out]
EOF
)"
```
