var urlParams = new URLSearchParams(window.location.search);

// liquid descends from top
fromtop = urlParams.get('fromtop');
if (fromtop) {
   $('.loading-text').addClass('loadin');
   $('.liquid').removeClass('firstfill');
   $('.liquid').addClass('fromtop');
   $('.cover-container').addClass('fadeinfast');
}

// rise liquid and fade out on navigation click
function rise_liquid_and_fade() {
   event.preventDefault();
   $('loading-text').removeClass('loadin');
   const fillAnimation = document.querySelector('.liquid');
   $('.liquid').removeClass('firstfill fromtop');
   $('.liquid').addClass('totop');
   $('.cover-container').removeClass('fadeinfast');
   $('.cover-container').addClass('fadeout');
   const loadAnimation = document.querySelector('.loading-text');
   fillAnimation.onanimationend = () => {
      $('.loading-text').addClass('loadout');
   };
   loadAnimation.onanimationend = () => {
      window.location = $(this).attr('href');
   }
}
$('.nav-link, .masthead-brand a').click(rise_liquid_and_fade);

page = parseInt(urlParams.get('page'))
drink = urlParams.get('drink')
type = urlParams.get('type')
base = urlParams.get('base')
descriptors = urlParams.get('descriptors')
minprice = urlParams.get('minprice')
maxprice = urlParams.get('maxprice')
minabv = urlParams.get('minabv')
maxabv = urlParams.get('maxabv')
lucky = urlParams.get('lucky')

const body = document.getElementsByTagName('body')[0];
const footer = document.getElementsByClassName('mastfoot')[0];
const main = document.getElementsByTagName('main')[0];
body.style.height = '100vh';
body.style.overflow = 'hidden';

const fillAnimation = document.querySelector('.liquid');
fillAnimation.onanimationend = () => {
   body.style.height = '100%';
   body.style.overflow = 'visible';
   $('.liquid').css('height', 'calc(100% - 15vw)');

   footer.style.position = 'absolute';
   footer.style.bottom = '0';
   footer.style.left = '0';
   footer.style.right = '0';
   main.style.marginBottom = '1.5rem';

   // position footer correctly if results are cached and page instaloads
   if (body.clientHeight != document.documentElement.clientHeight) {
      footer.removeAttribute('style');
      main.removeAttribute('style');
   }
};

function loadMore(firstCall) {
   // add loading animation in place of button while results loading
   $('#more-results').css('display', 'none');
   $('#loading-animation').css('display', 'inline-block');

   payload = {
      more: 'true',
      page: page + 1,
      drink: drink,
      type: type,
      base: base,
      descriptors: descriptors,
      minprice: minprice,
      maxprice: maxprice,
      minabv: minabv,
      maxabv: maxabv
   }
   if (firstCall) {
      payload.lucky = lucky
   }

   $.getJSON('/search', payload, function(data) {
      var results = data.results;
      page = data.page_number;
      count = data.count;
      drink = data.drink_name;

      $('.card').removeClass('last');

      // remove loading animation and display more results button if appropriate
      $('#loading-animation').css('display', 'none');
      if (count - ((page - 1) * 10 + results.length) > 1) {
         $('#more-results').css('display', 'inline-block');
      } else {
         var all_results = $('<p id="all-results-text"></p>');
         if (results.length == 0) {
            all_results.text('no matches found\xa0 :(');
         } else {
            $('#prefooter').append($('<hr id="all-results-divider" class="fancy mt-5 mb-4" />'));
            all_results.text('all results loaded');
         }
         $('#prefooter').append(all_results);                        
      }
      
      for (let i = 0; i < results.length; i++) {
         var card_index = ((page - 1) * 10 + i + 1).toString();

         var card = i == results.length - 1 ? $('<div class="card last"></div>') : $('<div class="card"></div>');

         var header = $('<div class="card-header d-flex" id="heading ' + card_index + '"></div>');
         var icon = $('<i class="fas fa-fw align-middle"></i>');
         if (results[i].drink.type == 'beer') {
            icon.addClass('fa-beer');
         } else if (results[i].drink.type == 'wine') {
            icon.addClass('fa-wine-glass-alt');
         } else if (results[i].drink.type == 'liquor') {
            icon.addClass('fa-wine-bottle');
         } else if (results[i].drink.type == 'cocktail') {
            icon.addClass('fa-cocktail');
         }
         header.append(icon);
         var header_heading = $('<h2 class="mb-0 flex-grow-1"></h2>');
         var header_heading_button = $('<button class="btn btn-link text-left" type="button" data-toggle="collapse" data-target="#collapse' + card_index + '" aria-controls="collapse' + card_index + '"></button>');
         var heading_button_drink_name = $('<span class="drink-name"></span>');
         heading_button_drink_name.append('<strong>' + card_index + '.</strong> ' + results[i].drink.name);
         header_heading_button.append(heading_button_drink_name);
         if (results[i].dist != null) {
            header_heading_button.append('<span class="percentage-match text-right">' + results[i].dist + '% match</span>')
         }
         header_heading.append(header_heading_button);
         header.append(header_heading);
         card.append(header);

         var content = $('<div id="collapse' + card_index + '" class="collapse" aria-labelledby="heading' + card_index + '"></div>');
         var info_body = $('<div class="card-body text-dark no-reviews"></div>');
         info_body.append($('<h4>About this ' + results[i].drink.type + '</h4>'));
         if (results[i].drink.description != null && /\S/.test(results[i].drink.description)) {
            var description = $('<p>' + results[i].drink.description + '</p>')
            description.wrapInTag({
               words: results[i].keywords
            });
            info_body.append(description);
         }
         if (results[i].drink.rating != null) {
            var rating_split = results[i].drink.rating.split('/')
            var rating_num = rating_split[0].slice(0, 5)
            var rating_join = rating_num + '/' + rating_split[1]
            info_body.append($('<p><strong>Rating:</strong> ' + rating_join + '</p>'));
         }
         if (results[i].drink.abv != null) {
            info_body.append($('<p><strong>ABV:</strong> ' + results[i].drink.abv + '%</p>'));
         }
         if (results[i].drink.price != null) {
            info_body.append($('<p><strong>Price:</strong> $' + results[i].drink.price + '</p>'));
         }
         if (results[i].drink.origin != null && !isNaN(results[i].drink.origin)) {
            info_body.append($('<p><strong>Origin:</strong> ' + results[i].drink.origin + '</p>'));
         }
         info_body.append($('<a href="/search?fromtop=true&page=0&drink=' + results[i].drink.name + '" class="similar-drinks-btn btn btn-outline-primary mr-1">Find similar drinks</a>'));
         info_body.on('click', '.similar-drinks-btn', rise_liquid_and_fade);
         info_body.append('\n');
         var urlMsg = (results[i].drink.price != null) ? 'Order online' : 'Learn more'
         info_body.append($('<a href="' + results[i].drink.url + '" class="btn btn-outline-primary" target="_blank">' + urlMsg + '</a>'));

         // add reviews tab if there are reviews
         if (results[i].reviews.length != 0) {
            info_body.removeClass('no-reviews');
            var tab_content = $('<div class="tab-content"></div>');
            var info_pane = $('<div id="info-' + card_index + '" class="tab-pane active show"></div>');
            info_pane.append(info_body);
            tab_content.append(info_pane);

            var review_pane = $('<div id="reviews-' + card_index + '" class="tab-pane"></div>');
            var review_body = $('<div class="card-body text-dark reviews"></div>');
            review_body.append($('<h4>Reviews</h4>'));
            results[i].reviews.forEach(review => {
               if (review.body != null) {
                  var review_quote = $('<blockquote class="blockquote"></blockquote>');
                  var body = $('<p class="mb-0">' + review.body + '</p>')
                  body.wrapInTag({
                     words: results[i].keywords
                  });
                  review_quote.append(body);
                  var review_footer = $('<footer class="blockquote-footer"></footer>');
                  review_footer.append('Reviewed by <cite>' + review.author + '</cite>' + (review.date != null ? ' on ' + review.date : '') + ' (Rating: ' + review.rating + ')');
                  review_quote.append(review_footer);
                  review_body.append(review_quote);
               }
            });
            review_pane.append(review_body);
            tab_content.append(review_pane);

            var tabs_ul = $('<ul class="nav nav-tabs"></ul>');
            var info_li = $('<li class="nav-item"></li>');
            info_li.append($('<a class="nav-link active" data-toggle="tab" href="#info-' + card_index + '">Information</a>'));
            tabs_ul.append(info_li);
            var reviews_li = $('<li class="nav-item"></li>');
            reviews_li.append($('<a class="nav-link" data-toggle="tab" href="#reviews-' + card_index + '">Reviews</a>'));
            tabs_ul.append(reviews_li);
            
            content.append(tab_content);
            content.append(tabs_ul);
         } else {
            content.append(info_body);
         }
         card.append(content);

         $('.results-list').append(card);
         const element = results[i];
         
      }
      
      $("#result").text(data.result);

      // position the footer correctly
      if (body.clientHeight != document.documentElement.clientHeight) {
         footer.removeAttribute('style');
         main.removeAttribute('style');
      }
   });
   return false;
}

loadMore(true);

$(function() {
   $('#more-results').bind('click', () => loadMore(false));
});

// function to wrap keywords in span tag
$.fn.wrapInTag = function(opts) {
  
  var tag = opts.tag || 'span',
      words = opts.words || [],
      regex = RegExp(words.join('|'), 'gi'),
      replacement = '<'+ tag +' class="keyword" style="font-weight: bold;">$&</'+ tag +'>';
  
  return this.html(function() {
    return $(this).text().replace(regex, replacement);
  });
};

// keywords toggle button
var keywords_toggle_container = $('<div class="keywords-toggle-container"></div>');
var keywords_toggle_button = $('<input type="checkbox" checked data-toggle="toggle" data-onstyle="dark" data-offstyle="secondary" data-style="border" data-size="sm" data-on="keywords" data-off="off">')
keywords_toggle_container.append(keywords_toggle_button);
keywords_toggle_button.change(function() {
   if ($(this).prop('checked')) {
      $('.keyword').css('font-weight', 'bold');
   } else {
      $('.keyword').css('font-weight', 'normal');
   }
})
if ((descriptors != '' && descriptors != null) || (drink != '' && drink != null)) {
   $('header.masthead').append(keywords_toggle_container);
   keywords_toggle_container.tooltip({'placement': 'left', 'trigger': 'hover', 'title': 'Click to toggle highlighting of keywords in beverage descriptions'});
}