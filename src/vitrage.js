/* Vitrage 0.0.2
 * A. Wart
 * MIT
 */

;(function(window, undefined) {
    var getWidth = function(element) {
      var elementWidth = element.offsetWidth,
        marginRight = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-right'));

      return {
        elementWidth: elementWidth,
        marginWidth: marginRight
      };
    },
    Vitrage = window.Vitrage = function(element) {
      element.vitrage = this;
      return (this.init || function() {}).call(this, element);
    };

    Vitrage.prototype = {
      init: function(element, options) {
        this.inst = element;
        this.listElement = element.querySelector('ul');
        this.clipWidth = element.offsetWidth;
        // Caching first item's element width;
        // we expect elements of same dimensions per instance
        this.itemWidth = getWidth(this.getItems()[0]);

        this.initPagination();
      },
      getItems: function() {
        if (!this.list || !this.list.length) {
          this.list = this.inst.querySelectorAll('ul li');
        }

        return this.list;
      },
      // TODO: realize reload in case of backenders;
      reload: function() {},
      initPagination: function() {
        var pages = this._calculatePages(),
          paginationElement = this._getPaginationElement(),
          fragment = document.createDocumentFragment();

        this.paginationElement = paginationElement;
        this.pages = pages;
        this.page = 1;

        for (page in pages) { if (pages.hasOwnProperty(page)) {
            var paginationLink = document.createElement("a"),
              isCurrentPage = page == this.page;

            paginationLink.setAttribute('class', 'carousel-pagination-item' + (isCurrentPage ? ' active' : ''));
            paginationLink.setAttribute('href', '#');
            paginationLink.setAttribute("data-page", page);

            paginationLink.on('click', function paginationItemClick (event) {
              var target = event.target,
                pageIndex = target.data('page');

              this.scrollToPage(pageIndex);

              event.preventDefault();
            }.bind(this));

            fragment.appendChild(paginationLink);
          }
        };

        paginationElement.appendChild(fragment);
      },
      _index: function() {
        if (arguments.length) {
          this.index = parseInt(arguments[0]);
        } else {
          return this.index || 1;
        }
      },
      scroll: function(index) {
        var listElement = this.listElement,
          itemWidth = this.itemWidth.elementWidth + this.itemWidth.marginWidth;

        listElement.style.transform = 'translateX(' + (- index * itemWidth) + 'px)';
        this._index(index);
      },
      scrollToPage: function(pageIndex) {
        var page = this.pages[pageIndex],
          pageLength = page.length || 1,
          scrollIndex = (pageIndex - 1) * pageLength,
          paginationElement = this.paginationElement || this._getPaginationElement(),
          targetPage;

        this.scroll(scrollIndex);
        this.page = pageIndex;

        paginationElement.querySelectorAll('.carousel-pagination-item').removeClass('active');
        targetPage = paginationElement.querySelector('[data-page="' + pageIndex + '"]').classList.add('active');

        return scrollIndex;
      },
      scrollPageLeft: function() {
        var pagesKeys = Object.keys(this.pages),
          nextPage = this.page == 1 ? pagesKeys[pagesKeys.length - 1] : this.page - 1;

        this.scrollToPage(nextPage);
      },
      scrollPageRight: function() {
        var pagesKeys = Object.keys(this.pages),
         nextPage = this.page == pagesKeys.length ? 1 : this.page + 1;

        this.scrollToPage(nextPage);
      },
      _getPaginationElement: function() {
        var paginationElement,
          inst = this.inst,
          cursor;

        if (inst.nextElementSibling.classList.contains('js-vitrage-pagination')) {
          paginationElement = inst.nextElementSibling;
        } else {
          while (!paginationElement) {
            cursor = cursor || inst;
            paginationElement = cursor.querySelector('.js-vitrage-pagination')
            cursor = cursor.parentElement;
          }
        }

        return paginationElement;
      },
      _calculatePages: function() {
        var items = this.getItems(),
            clip = this.clipWidth,
            accumulatedWidth = 0,
            page = 1,
            pages = {},
            currentItem,
            pageLength,
            lastPage,
            delta,
            width = this.itemWidth.elementWidth; //+ this.itemWidth.marginWidth for what it's worth;

        for (var i = 0, l = items.length; i < l; i++) {
          currentItem = items[i];

          if ((accumulatedWidth + width) > clip) {
              page++;
              accumulatedWidth = 0;
          }

          accumulatedWidth += width;

          if (!pages[page]) {
              pages[page] = currentItem;
          } else {
              if (pages[page].length) {
                pages[page].push(currentItem)
              } else{
                pages[page] = [pages[page], currentItem]
              }
          }
        };

        lastPage = pages[page];

        // if the last page have deficiency items, clone first ones to moke circle wrapping
        if (page > 2 && pages[page-1].length > 1 &&
          (!lastPage.length || lastPage.length < (normalPageLength = pages[page-1].length))) {

          if (!lastPage.length) { pages[page] = [lastPage] };

          delta = normalPageLength - pages[page].length;

          if (delta > 0) {
            for (var x = 0; x < delta; x++) {
              pages[page].push(pages[1][x])
              this.listElement.appendChild(pages[1][x].cloneNode(true));
            }
          }
        }

        return pages;
    }
  }
})(window);
