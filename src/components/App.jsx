import React, { useState, useEffect } from 'react';
import Searchbar from './Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import Modal from './Modal';
import Loader from './Loader';
import getImages from 'services/api';


function App() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [showLoadBtn, setShowLoadBtn] = useState(false);
  const [status, setStatus] = useState('idle');
  const [showModal, setShowModal] = useState(false);
  const [largeImageURL, setLargeImageURL] = useState('');
  const [tags, setTags] = useState('');
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    setStatus('pending');

    try {
      getImages(query, page, perPage).then(responce => {
        // console.log(responce, 'responce');
        if (responce.status === 200) {
          setItems(prevState => [...prevState, ...responce.data.hits]);
          setStatus('resolved');

          isShowLoadBtn(responce);

          if (responce.data.hits.length === 0) {
            setStatus('rejected');
          }
        }
      });
    } catch (error) {
      console.error(error);
      setStatus('rejected');
    }
  }, [page, query]);

  const formSubmitHandler = query => {
    setPage(1);
    setQuery(query);
    setItems([]);
    return;
  };

  const loadMore = () => {
    setPage(prevState => prevState + 1);
  };

  const isShowLoadBtn = responce => {
    if (perPage * page < responce.data.total) {
      return setShowLoadBtn(true);
    }
    return setShowLoadBtn(false);
  };

  const toggleModal = () => {
    setShowModal(prevState => !prevState);
  };

  const galleryClick = ({ tags, largeImageURL }) => {
    toggleModal();
    setLargeImageURL(largeImageURL);
    setTags(tags);
  };

  return (
    <>
      <Searchbar onSubmit={formSubmitHandler} />

      <ImageGallery items={items} onClick={galleryClick} />

      {status === 'pending' && <Loader />}

      {showLoadBtn && status !== 'pending' && <Button onClick={loadMore} />}

      {showModal && (
        <Modal onClose={toggleModal} showModal={showModal}>
          <img src={largeImageURL} alt={tags}></img>
        </Modal>
      )}

      {status === 'rejected' && <h1>Empty request</h1>}
    </>
  );
}

export default App;
