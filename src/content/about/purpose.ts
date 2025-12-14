import type { PageContent } from '@/pages/ContentPage'

export const purposeContent: PageContent = {
  title: 'Purpose of Education',
  subtitle: 'Understanding why we educate',
  sections: [
    {
      heading: 'What is the purpose of education?',
      content: `
        <p>Before we proceed further we must first understand what is the purpose of education:</p>
        <ul>
          <li><strong>Paulo Freire</strong> - Education as a means of liberation</li>
          <li><strong>Happiness</strong> - Education to provide happiness for children</li>
          <li><strong>Progress</strong> - Progress for humanity</li>
        </ul>
      `
    },
    {
      heading: 'The Three Purposes of Education',
      content: `
        <p>The philosopher Gert Biesta posits that education serves three interconnected purposes:</p>
        <ul>
          <li><strong>Qualification</strong> - Acquiring knowledge and skills</li>
          <li><strong>Socialization</strong> - Integrating into culture and society</li>
          <li><strong>Subjectification</strong> - Developing agency as a unique self in the world</li>
        </ul>
        <p>We believe that there needs to be a better balance between the three. Right now the system focuses heavily on qualification and very little on socialisation and subjectification. Particularly agency has not been built at all.</p>
      `
    },
    {
      heading: 'Why do we need new approaches?',
      content: `
        <p>No matter what view you take on the purpose of education it's safe to say that the current system is failing:</p>
        <ul>
          <li>Inequities and how the current system reproduces them</li>
          <li>The design of the current system to produce factory workers</li>
          <li>AI and digital technologies creating even more extreme outcomes and divides</li>
          <li>Children are not enjoying their education</li>
        </ul>
        <p>Education should be a means for liberation, not a system that perpetuates existing inequities.</p>
      `
    }
  ]
}
