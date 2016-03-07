function topPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetTop + topPosition(domElt.offsetParent);
}

module.exports = function (React, ReactDOM) {

  if (React.addons && React.addons.InfiniteScroll) {
    return React.addons.InfiniteScroll;
  }
  React.addons = React.addons || {};
  var InfiniteScroll = React.addons.InfiniteScroll = React.createClass({
    /**
     * Detects if page is framed
     * @return {boolean}
     */
    _inIframe: function () {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    },
    _previousHeight: null,
    getDefaultProps: function () {
      return {
        pageStart: 0,
        hasMore: false,
        loadMore: function () {},
        threshold: 250
      };
    },
    componentDidMount: function () {
      this.pageLoaded = this.props.pageStart;
      this.attachScrollListener();
      window.addEventListener('message', this._receiveMessage);
    },
    componentDidUpdate: function () {
      this.pageLoaded = this.props.pageStart;
      this.attachScrollListener();
    },
    render: function () {
      var props = this.props;

      return React.DOM.div({ className: 'infinite-scroll-container' }, props.children, props.hasMore && (props.loader || InfiniteScroll._defaultLoader));
    
    },
    _receiveMessage: function(e) {
      try {
        var data = (e.data) ? JSON.parse(e.data) : null;
        if (data && data.scrollTop) {
          var el = this.getDOMNode();
          var pos = topPosition(el) + el.offsetHeight - data.scrollTop - data.innerHeight;
          //console.log(pos +' '+Number(this.props.threshold)+' '+data.scrollTop+' '+data.innerHeight);
          if (pos < Number(this.props.threshold) && this._previousHeight !== el.offsetHeight) {
            this._previousHeight = el.offsetHeight;
            this.props.loadMore(this.pageLoaded += 1);
          }
        }
      } catch (err) {

      }
    },
    scrollListener: function () {
      var el = ReactDOM.findDOMNode(this);
      var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      if (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < Number(this.props.threshold)) {
        this.detachScrollListener();
        // call loadMore after detachScrollListener to allow
        // for non-async loadMore functions
        this.props.loadMore(this.pageLoaded += 1);
      }
    },
    attachScrollListener: function () {
      if (!this.props.hasMore || this._inIframe()) {
        return;
      }
      window.addEventListener('scroll', this.scrollListener);
      window.addEventListener('resize', this.scrollListener);
      this.scrollListener();
    },
    detachScrollListener: function () {
      window.removeEventListener('scroll', this.scrollListener);
      window.removeEventListener('resize', this.scrollListener);
    },
    componentWillUnmount: function () {
      this.detachScrollListener();
      window.removeEventListener('message', this._receiveMessage);
    }
  });
  InfiniteScroll.setDefaultLoader = function (loader) {
    InfiniteScroll._defaultLoader = loader;
  };
  return InfiniteScroll;
};
