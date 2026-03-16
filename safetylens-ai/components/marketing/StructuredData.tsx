export default function StructuredData() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vorsa AI',
    legalName: 'OSO Construction Tech',
    url: 'https://getvorsa.ai',
    description:
      'AI-powered safety audit platform for construction',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@getvorsa.ai',
      contactType: 'customer support',
    },
  }

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Vorsa AI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '29.00',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '29.00',
          priceCurrency: 'USD',
          billingDuration: 'P1M',
        },
      },
      {
        '@type': 'Offer',
        name: 'Professional',
        price: '49.00',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '49.00',
          priceCurrency: 'USD',
          billingDuration: 'P1M',
        },
      },
      {
        '@type': 'Offer',
        name: 'Coach',
        price: '89.00',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '89.00',
          priceCurrency: 'USD',
          billingDuration: 'P1M',
        },
      },
    ],
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Vorsa AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vorsa AI is an AI-powered safety audit platform built for the construction industry. It analyzes jobsite photos to identify OSHA violations, hazards, and safety risks in seconds.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the AI safety analysis work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload a photo of your jobsite and Vorsa AI uses computer vision and large language models to detect safety hazards, identify potential OSHA violations, and provide actionable recommendations to improve site safety.',
        },
      },
      {
        '@type': 'Question',
        name: 'What OSHA standards does Vorsa cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vorsa AI covers a wide range of OSHA construction standards including fall protection (1926 Subpart M), scaffolding (1926 Subpart L), electrical safety (1926 Subpart K), PPE requirements, and many more commonly cited standards.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All data is encrypted in transit and at rest. Vorsa AI is hosted on secure cloud infrastructure and we never share your jobsite photos or audit data with third parties.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I try Vorsa AI for free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Vorsa AI offers a 14-day free trial with no credit card required. You can analyze jobsite photos, generate reports, and explore all features before choosing a paid plan.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplication),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  )
}
