import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

program
  .name('transport')
  .description('Проста CLI програма для транспортного варіанта')
  .version('1.0.0');

// Глобальна опція для файлу
program.option('-f, --file <path>', 'шлях до json файлу', 'data.json');

// Функція читання даних
function getData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Помилка: Файл "${filePath}" не знайдено.`);
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error('Помилка читання або некоректний JSON формат.');
    process.exit(1);
  }
}

// 1. Загальна можливість: Перелік
program
  .command('list')
  .description('Показати список маршрутів')
  .action(() => {
    const data = getData(program.opts().file);
    const routes = data.routes || data;
    console.log('Список маршрутів:');
    routes.forEach((r, i) => console.log(`${i + 1}. ${r.name || r.routeNumber}`));
  });

// 2. Загальна можливість: Один елемент
program
  .command('item')
  .description('Показати повну інформацію про маршрут')
  .requiredOption('-n, --name <name>', 'назва маршруту')
  .action((opts) => {
    const data = getData(program.opts().file);
    const routes = data.routes || data;
    const found = routes.find(r => r.name === opts.name || r.routeNumber === opts.name);
    if (!found) {
      console.error('Маршрут не знайдено.');
      process.exit(1);
    }
    console.log(JSON.stringify(found, null, 2));
  });

// 3. Загальна можливість: Окреме поле
program
  .command('field')
  .description('Показати значення окремого поля')
  .requiredOption('-n, --name <name>', 'назва маршруту')
  .requiredOption('-p, --field <field>', 'назва поля')
  .action((opts) => {
    const data = getData(program.opts().file);
    const routes = data.routes || data;
    const found = routes.find(r => r.name === opts.name || r.routeNumber === opts.name);
    if (!found || found[opts.field] === undefined) {
      console.error('Поле або маршрут не знайдено.');
      process.exit(1);
    }
    console.log(`Значення поля ${opts.field}:`, found[opts.field]);
  });

// --- ВАРІАНТ 9 (ТРАНСПОРТ) ---

// 1. Зупинки з координатами
program
  .command('stops')
  .description('Показати зупинки маршруту')
  .requiredOption('-n, --name <name>', 'назва маршруту')
  .action((opts) => {
    const data = getData(program.opts().file);
    const found = (data.routes || data).find(r => r.name === opts.name);
    if (!found || !found.stops) {
      console.error('Зупинки не знайдені.');
      process.exit(1);
    }
    console.log(`Зупинки для ${opts.name}:`);
    found.stops.forEach((s, i) => console.log(`${i + 1}. ${s.name || s.title}`));
  });

// 2. Інтервал руху
program
  .command('interval')
  .description('Інтервал руху (weekday або weekend)')
  .requiredOption('-n, --name <name>', 'назва маршруту')
  .requiredOption('-d, --day <day>', 'тип дня')
  .action((opts) => {
    const data = getData(program.opts().file);
    const found = (data.routes || data).find(r => r.name === opts.name);
    if (!found || !found.intervals) {
      console.error('Інтервали відсутні.');
      process.exit(1);
    }
    console.log(`Інтервал (${opts.day}):`, found.intervals[opts.day]);
  });

// 3. Низькопідлогові машини
program
  .command('lowfloor')
  .description('Маршрути з низькопідлоговими машинами')
  .action(() => {
    const data = getData(program.opts().file);
    const routes = data.routes || data;
    const filtered = routes.filter(r => r.lowFloor === true);
    console.log('Низькопідлогові маршрути:');
    filtered.forEach(r => console.log(`- ${r.name || r.routeNumber}`));
  });

program.parse(process.argv);