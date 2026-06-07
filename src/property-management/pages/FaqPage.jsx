import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import GatewayNavbar from '../components/GatewayNavbar';
import GatewayFooter from '../components/GatewayFooter';
import PmSeoHead from '../components/PmSeoHead';
import Icon from '../components/Icon';
import { FAQ_CATEGORIES, FAQ_COUNT, FAQ_INTRO, allFaqItems } from '../content/faqData';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function FaqPage() {
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const enter = () => navigate(hrefFor(base, 'dashboard'));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  const matchCount = useMemo(
    () => filtered.reduce((n, c) => n + c.items.length, 0),
    [filtered],
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqItems().map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={`${FAQ_INTRO.title} | ${config.productName}`}
        description={`${FAQ_COUNT}+ answers about ${config.productName} — AI property management, ROI, integrations, compliance, U.S. support, and the live demo.`}
        path={`${base}/faq`}
        keywords={`${config.productName} FAQ, property management AI questions, multifamily software help`}
        jsonLd={jsonLd}
      />
      <GatewayNavbar onEnter={enter} />

      <div className={`${gw.gatewayInner} ${gw.faqPage}`}>
        <header className={gw.faqHeader}>
          <p className={gw.eyebrow}>{config.productName}</p>
          <h1 className={gw.heroTitle}>{FAQ_INTRO.title}</h1>
          <p className={gw.sectionSub}>{FAQ_INTRO.subtitle}</p>
          <p className={gw.faqCount}>{FAQ_COUNT} questions across {FAQ_CATEGORIES.length} topics</p>

          <div className={gw.faqSearchWrap}>
            <Icon name="search" size={18} className={gw.faqSearchIcon} />
            <input
              type="search"
              className={gw.faqSearch}
              placeholder="Search questions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search FAQ"
            />
            {query && (
              <span className={gw.faqSearchMeta}>
                {matchCount} match{matchCount === 1 ? '' : 'es'}
              </span>
            )}
          </div>
        </header>

        <div className={gw.faqBody}>
          {filtered.map((cat) => (
            <section key={cat.id} className={gw.faqCategory} id={cat.id}>
              <h2 className={gw.faqCategoryTitle}>{cat.title}</h2>
              <div className={gw.faqList}>
                {cat.items.map((item) => {
                  const id = `${cat.id}-${item.q.slice(0, 24)}`;
                  const isOpen = openId === id;
                  return (
                    <article key={item.q} className={gw.faqItem}>
                      <button
                        type="button"
                        className={gw.faqQuestion}
                        onClick={() => toggle(id)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <span className={gw.faqChevron}>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <div className={gw.faqAnswer}>{item.a}</div>}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <p className={gw.sectionSub}>No questions match your search. Try different keywords or email {config.supportEmail}.</p>
          )}
        </div>

        <div className={gw.faqCta}>
          <p className={gw.sectionSub}>Ready to see it live?</p>
          <button type="button" className={gw.enterBtn} onClick={enter}>
            Enter {config.productName}
            <Icon name="bolt" size={22} />
          </button>
        </div>
      </div>

      <GatewayFooter showFaqLink={false} />
    </div>
  );
}
