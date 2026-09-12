export interface AttributeIssue { name: (string | number)[]; errors: string[] }
type ObjectValue = Record<string, unknown>;
const obj = (value: unknown): ObjectValue => value && typeof value === 'object' && !Array.isArray(value) ? value as ObjectValue : {};
export function validateAttributeValues(values: ObjectValue): AttributeIssue[] {
  const issues: AttributeIssue[] = [];
  const issue = (path: (string | number)[], text: string) => issues.push({ name: path, errors: [text] });
  function visit(value: unknown, path: (string | number)[]) {
    if (value == null) return;
    if (Array.isArray(value)) {
      const codes = new Set<string>();
      const orders = new Set<number>();
      value.forEach((row, index) => {
        if (row == null) { issue([...path, index], 'Заполните или удалите пустую строку'); return; }
        const record = obj(row);
        const code = record.code ?? obj(record.grape).code ?? obj(record.dimension).code;
        if (typeof code === 'string') {
          if (codes.has(code)) issue([...path, index, record.grape ? 'grape' : record.dimension ? 'dimension' : 'code'], 'Значение повторяется');
          codes.add(code);
        }
        if (typeof record.order === 'number') {
          if (orders.has(record.order)) issue([...path, index, 'order'], 'Номер стадии повторяется');
          orders.add(record.order);
        }
        if (path.at(-1) === 'grapeComposition' && !record.grape) issue([...path, index, 'grape'], 'Выберите сорт');
        if (path.at(-1) === 'agingStages') for (const key of ['order', 'purpose']) if (record[key] == null) issue([...path, index, key], 'Заполните поле');
        if (path.at(-1) === 'sensoryRatings') {
          if (!record.dimension) issue([...path, index, 'dimension'], 'Выберите измерение');
          if (!record.rating) issue([...path, index, 'rating', 'value'], 'Укажите оценку');
        }
        visit(row, [...path, index]);
      });
      return;
    }
    if (typeof value !== 'object') return;
    const data = obj(value);
    const key = path.at(-1);
    const required = (keys: string[]) => keys.forEach(field => { if (data[field] == null || data[field] === '') issue([...path, field], 'Заполните поле или очистите весь блок'); });
    if (key === 'servingTemperature') required(['min', 'max']);
    if (key === 'cellaringPotential') required(['minYears', 'maxYears', 'reference']);
    if (key === 'durationMonths') {
      if (data.min == null && data.max == null) issue([...path, 'min'], 'Укажите хотя бы одну границу срока');
      required(['minInclusive', 'maxInclusive']);
      if (data.min != null && data.min === data.max && (data.minInclusive === false || data.maxInclusive === false)) issue([...path, 'max'], 'При одинаковых границах обе должны включаться');
    }
    for (const [min, max] of [['min', 'max'], ['minYears', 'maxYears']]) if (typeof data[min] === 'number' && typeof data[max] === 'number' && data[min] > data[max]) issue([...path, max], 'Верхняя граница меньше нижней');
    if (key === 'aging') {
      required(['status']);
      if (data.status === 'not_aged' && (data.durationMonths != null || (Array.isArray(data.vessels) && data.vessels.length))) issue([...path, 'status'], 'Для отсутствующей выдержки очистите срок и ёмкости');
    }
    if (path.includes('sensoryProfile') && path.length === 3 || key === 'rating') {
      required(['value', 'sourceId']);
      if (typeof data.value === 'number' && (!Number.isFinite(data.value) || data.value < 1 || data.value > 5)) issue([...path, 'value'], 'Оценка должна быть от 1 до 5');
    }
    if (key === 'whiskyDetails') {
      required(['ageStatementStatus']);
      if (data.ageStatementStatus === 'stated') required(['ageStatementYears']);
      else if (data.ageStatementYears != null) issue([...path, 'ageStatementStatus'], 'Для числового возраста выберите «Возраст указан»');
    }
    if ('grapeComposition' in data) {
      const shares = Array.isArray(data.grapeComposition) ? data.grapeComposition.map(obj) : [];
      const sum = shares.reduce((total, share) => total + (typeof share.percent === 'number' ? share.percent : 0), 0);
      if (sum > 100 + 1e-8 || (data.grapeCompositionComplete === true && (Math.abs(sum - 100) > 1e-8 || shares.some(share => share.percent == null)))) issue([...path, 'grapeCompositionComplete'], 'Полный состав должен давать 100%; сумма долей не может превышать 100%');
    }
    if ('vintageStatus' in data && (data.productionYear != null ? data.vintageStatus !== 'vintage' : data.vintageStatus === 'vintage')) issue([...path, 'vintageStatus'], 'Год и статус винтажа должны соответствовать друг другу');
    Object.entries(data).forEach(([field, item]) => visit(item, [...path, field]));
  }
  visit(values.extendedDetails, ['extendedDetails']);
  return issues;
}
