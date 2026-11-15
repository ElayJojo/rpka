"""Сборка статичных страниц РПКА из шаблонов.
Запуск: python3 src/build.py  (из корня репозитория)
Подставляет SVG-спрайт логотипа и иконок, карточки проектов и сегменты пайплайна."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
P1 = (SRC / 'logo-swoosh.path').read_text().strip()
P2 = (SRC / 'logo-letters.path').read_text().strip()
VB = '0 0 5091 5587'

SPRITE = f'''<svg width="0" height="0" style="position: absolute" aria-hidden="true">
  <symbol id="logo-swoosh" viewBox="{VB}"><path fill-rule="evenodd" d="{P1}"/></symbol>
  <symbol id="logo-letters" viewBox="{VB}"><path d="{P2}"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
</svg>'''

def logo(swoosh, letters, cls=''):
    return (f'<svg class="{cls}" viewBox="{VB}" aria-hidden="true">'
            f'<use href="#logo-swoosh" style="fill: {swoosh}"/><use href="#logo-letters" style="fill: {letters}"/></svg>')

A2 = ('<svg class="arrow" aria-hidden="true"><use href="#i-arrow"/></svg>'
      '<svg class="arrow" aria-hidden="true"><use href="#i-arrow"/></svg>')

PROJECTS = [
    ('forum', 'i3-forum.png', 'Весна · Москва', 'Форум РПКА', 'Площадка встречи инноваций, сырья и технологий. День первый — наука и регулирование, день второй — бренды.'),
    ('conf', 'i3-conf.png', 'С 1996 года', 'Конференция', '«Косметическая индустрия: взгляд в будущее» — крупнейшая отраслевая конференция в Восточной Европе.'),
    ('award', 'i3-award.png', 'С 2013 года', 'Премия «Моя косметика»', 'Лучшая косметика российского производства. В 2026 году — 399 продуктов в 37 номинациях.'),
    ('bio', 'i3-bio.png', 'Экспертная оценка', 'biorus', 'Первая российская система экспертной оценки натуральной и органической косметики.'),
    ('expert', 'i3-expert.png', 'Энциклопедия', 'CosmetExpert', 'Онлайн-энциклопедия косметических ингредиентов: химия, технология, регуляторика.'),
    ('mentor', 'i3-mentor.png', 'Онлайн-школа', '«Наставник»', 'Школа НОКХ и CosmetExpert: 7 курсов на стыке химии, биологии, законодательства и маркетинга.'),
    ('contest', 'i3-contest.png', 'При конференции', 'Конкурсы', '«Лучший технолог» и «Молодые учёные» — путь к мастерству в отрасли.'),
]

def project_cards():
    out = []
    for i, (k, img, meta, name, desc) in enumerate(PROJECTS):
        ink = ' pcard--ink' if i == 1 else ''
        out.append(f'''    <a class="pcard{ink}" href="#projects" data-card>
      <div class="pcard__media" style="background: var(--{k}-l)"><span class="br" style="color: var(--{k}-d)">{meta}</span><img src="assets/img/{img}" alt="" loading="lazy" width="136" height="136"></div>
      <div class="pcard__body"><span class="pcard__title">{name}</span><span class="pcard__desc">{desc}</span><span class="pcard__go">Перейти <svg class="arrow" aria-hidden="true" style="width: 14px; height: 14px"><use href="#i-arrow"/></svg></span></div>
    </a>''')
    return '\n'.join(out)

STEPS = ['Инициатива', 'Присоединение', 'Рабочая группа', 'Данные', 'Позиция', 'Обращение', 'Статус']
LEGEND = ''.join(f'<span title="{s}">{i + 1:02d}</span>' for i, s in enumerate(STEPS))
SEGS = '<i></i>' * 7

def build(template, out, extra=None):
    html = (SRC / template).read_text()
    rep = {
        '{{SPRITE}}': SPRITE,
        '{{LOGO_GARNET}}': logo('var(--garnet)', 'var(--ink)'),
        '{{LOGO_FOOTER}}': logo('var(--powder)', '#FFFFFF'),
        '{{A2}}': A2,
        '{{PROJECT_CARDS}}': project_cards(),
        '{{LEGEND}}': LEGEND,
        '{{SEGS}}': SEGS,
    }
    rep.update(extra or {})
    for k, v in rep.items():
        html = html.replace(k, v)
    assert '{{' not in html, 'незаполненный шаблон в ' + template
    (ROOT / out).write_text(html)
    print('собрано', out, len(html), 'байт')

if __name__ == '__main__':
    build('index.template.html', 'index.html')
    if (SRC / 'concept.template.html').exists():
        build('concept.template.html', 'concept.html')
