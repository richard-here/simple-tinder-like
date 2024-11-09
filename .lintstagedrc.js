module.exports = {
  '*.md': 'prettier --write',
  '*.js': ['prettier --write', 'eslint --fix']
}