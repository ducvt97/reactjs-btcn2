import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Gallery from 'react-grid-gallery'
import InfiniteScroll from 'react-infinite-scroller';
//import './index.css';

var flickr = {
    api_key: "0e7ed22067a7a4464503bb479d830527",
    user_id: "c97f1605d22916fc"
};


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            images: [],
        }
    }
    
    loadData = (page) => {
        axios.get(`https://api.flickr.com/services/rest/?format=json&method=flickr.interestingness.getList&api_key=` + flickr.api_key + `&per_page=20&page=` + page)
        .then(res => {
            var temp = res.data.substr(14);
            temp = temp.slice(0, -1);
            const data = JSON.parse(temp);
            this.setState({ photos: [...this.state.photos,...data.photos.photo] });

            data.photos.photo.map(photo => {
                axios.get(`https://api.flickr.com/services/rest/?format=json&method=flickr.photos.getInfo&api_key=` + flickr.api_key + `&photo_id=` + photo.id)
                .then(res => {
                    temp = res.data.substr(14);
                    temp = temp.slice(0, -1);
                    var detail = JSON.parse(temp);
                    //console.log(detail.photo);
                    var galleryItem = {
                        src: createImgURL(photo.farm, photo.id, photo.server, photo.secret),
                        thumbnail: createImgURL(photo.farm, photo.id, photo.server, photo.secret),
                        thumbnailWidth: 320,
                        thumbnailHeight: 230,
                        title: detail.photo.title._content,
                        author: detail.photo.owner.realname,
                        views: detail.photo.views,
                    };
                    var arr_temp = this.state.images;
                    arr_temp.push(galleryItem);
                    this.setState({images: arr_temp});
                })
            });
        });
    }

    render() {
        const images = this.state.images.map((img) => {
            img.customOverlay = (
                <div style={captionStyle}>
                    <div>{img.title}</div>
                </div>);
            return img;
        });
        return (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={this.loadData}
                    hasMore={true}
                    loader={<div className="loader" key={0}>Loading ...</div>}
                    useWindow={true}
                >
                    <div style={{
                        display: "block",
                        minHeight: "1px",
                        width: "100%",
                        border: "1px solid #ddd",
                        overflow: "auto"}}
                    >
                        <Gallery
                            images={images}
                            enableImageSelection={false}
                        />
                    </div>
                </InfiniteScroll>

            
        )
    }
}

const captionStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    maxHeight: "240px",
    overflow: "hidden",
    position: "absolute",
    bottom: "0",
    width: "100%",
    color: "white",
    padding: "2px",
    fontSize: "90%"
};

function createImgURL(farm_id,id,server_id,secret) {
    return "https://farm" + farm_id + ".staticflickr.com/" + server_id + "/" + id + "_" + secret + ".jpg";
}
ReactDOM.render(
    <App style={{margin:"30px 60px 30px 60px"}}/>,
    document.getElementById('root')
  );