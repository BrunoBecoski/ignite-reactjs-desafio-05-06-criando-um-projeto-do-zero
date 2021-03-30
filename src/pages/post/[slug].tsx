import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}


export default function Post({ post }: PostProps) {
  // TODO
  
  const { isFallback } = useRouter(); 

  const reading = post.data.content.reduce((total, value) => {
    const regex = /\W+/

    const totalHeading = value.heading.split(regex).length;
    const totalContent = RichText.asText(value.body).split(regex).length;

    total = total + totalHeading;
    total = total + totalContent;

    return total;
  }, 0);

  return (
    <>
      <Header />

      {isFallback ?
        <h1 className={styles.loading}>Carregando...</h1>

        :
        <>
          <img className={styles.banner} src='https://images.unsplash.com/photo-1564865878688-9a244444042a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80' alt="Eat Sleep Code Repeat" />

          <main className={commonStyles.container}>
            <article className={`${commonStyles.post} ${styles.post}`}>

              <h1>{post.data.title}</h1>
              <div className={styles.info}>
                <span>
                  <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    "dd MMM y",
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
                <span>
                  <FiClock />
                  {Math.ceil(reading / 200)} min      
                </span>
              </div>

              {post.data.content.map((content) => 
                <div key={content.heading} className={styles.content}>
                  <h2>{content.heading}</h2>
                  <div 
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
                  />
                </div> 
              )}
            
            </article>
          </main>
        </>
      }
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [],
    pageSize: 5,
  });

  // TODO

  return {
    paths: posts.results.map(result => ( { params: { slug: result.uid } })),
    fallback: true,
  }
};


export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const content = response.data.content.map((content) => {
      return {
        heading: content.heading,
        body: content.body,
      }
  })

  // console.log(JSON.stringify(response.data, null, 2));

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content,
    },
    uid: response.uid
  }
  
  return {
    props: {
      post
    }
  }
};
