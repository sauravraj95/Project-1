// Basic of import and export
// import string from './models/Search';
// import {add, multiply, ID } from './views/searchView'; // as same nanme - 1st way to import
// import {add as a, multiply as m, ID } from './views/searchView'; // change the name - 2nd way to import
// import * as searchView from './views/searchView'; // - 3rd way
// console.log(`Using Imported function!! ${add(ID, 2)} and ${multiply(2, 4)}. ${string}`)
// console.log(`Using Imported function!! ${a(ID, 2)} and ${m(2, 4)}. ${string}`)
// console.log(`Using Imported function!! ${searchView.add(searchView.ID, 2)} and ${searchView.multiply(2, 4)}. ${string}`) 



// 918ba96fef60633142979bc796fad632
// https://www.food2fork.com/api/search


import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
/******************----- Global State of app------********************** 
 * - Search Object
 * - Current recipe object
 * - Shopping List Object
 * - Liked recipe 
*/
const state = {};
/***********
 * Search Controller start
 */

const controlSearch = async () => {
    // 1- Get the query from the view
    const query = searchView.getInput();
    // const query = 'pizza'; // for testing
    // console.log(query);
    if (query) {
        // 2- New Search Object and add to the state

        state.search = new Search(query);

        // 3- Preparing UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes)
        try {
            //4 - Search for recipe
            await state.search.getResults();

            // 5 - Render result on UI
            clearLoader();
            searchView.renderResult(state.search.result);
        } catch (error) {
            alert('Something wrong in search');
            clearLoader();
        }

    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResult(state.search.result, goToPage);
    }

});

/***********
 * Search Controller end
 */

/***********
 * Recipe Controller start
 */

const controlRecipe = async () => {
    // get id from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        // prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        // highlight Selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new Recipe objects
        state.recipe = new Recipe(id);


        try {
            // Get recipe data  and parse ingridents
            await state.recipe.getRecipie();

            state.recipe.parseIngredients();

            //calculate servings and time
            state.recipe.calcServings();
            state.recipe.calcTime()
            // render the recipie
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (error) {
            alert('Error Processing recipe');
        }

    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/***********
 * Recipe Controller End
 */

/***********
* List Controller start
*/

const controlList = () => {
    // 1. Create a new list if there is no list
    if (!state.List) state.list = new List();

    // 2. Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

}
// Handle Delete and Update list Item event
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle The delete btn
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Detele from UI
        listView.deleteItem(id);

        //Handle the count Update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/***********
* Like Controller start
*/

const controllLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // user has NOT yet liked the current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLikes(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // toggle the like btn
        likesView.toggleLikeBtn(true);

        // Add liked to UI list
        likesView.renderLike(newLike);

        // user HAS liked the current recipe
    } else {

        // Remove like to the state
        state.likes.deleteLike(currentID);

        // toggle the like btn
        likesView.toggleLikeBtn(false);

        // Remove liked from UI list
        likesView.deleteLike(currentID);

    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on the page when reload the windows
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore the like
    state.likes.readStorage();

    //toggle like menu btn
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render The Existing Likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

/***********
* Like Controller End
*/

//  handling recipe button click
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease btn is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase btn is clicked       
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to the shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controllLike();

    }
});

























