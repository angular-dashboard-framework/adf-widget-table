/*
 * The MIT License
 *
 * Copyright (c) 2015, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

angular.module('adf.widget.table', ['adf.provider'])
  .config(function(dashboardProvider){

    dashboardProvider
      .widget('table', {
        title: 'Table',
        description: 'Displays a table of data from a json url',
        templateUrl: '{widgetsPath}/table/src/view.html',
        controller: 'tableController',
        controllerAs: 'vm',
        reload: true,
        resolve: {
          data: function(tableService, config){
            return tableService.get(config);
          }
        },
        edit: {
          controller: 'tableEditController',
          controllerAs: 'vm',
          templateUrl: '{widgetsPath}/table/src/edit.html'
        }
      });

  })
  .service('tableService', function($q, $http, $parse){

    function createColumns(config, model){
      var columns = [];

      angular.forEach(config.columns, function(col, i){
        if (col.title && col.path) {
          model.headers[i] = col.title;
          columns.push({
            title: col.title,
            path: $parse(col.path)
          });
        }
      });

      return columns;
    }

    function createDataModel(config, data){
      var model = {
        headers: [],
        rows: []
      };

      var root = data;
      if (config.root){
        root = $parse(config.root)(data);
      }

      var columns = createColumns(config, model);
      angular.forEach(root, function(node){
        var row = [];

        angular.forEach(columns, function(col, i){
          var value = col.path(node);
          row[i] = value;
        });

        model.rows.push(row);
      });

      return model;
    }

    function get(config){
      var deferred = $q.defer();
      $http.get(config.url)
        .success(function(data){
          deferred.resolve(createDataModel(config, data));
        })
        .error(function(){
          deferred.reject();
        });

      return deferred.promise;
    }

    return {
      get: get
    };
  })
  .controller('tableEditController', function(config){
    this.config = config;

    function getColumns(){
      if (!config.columns){
        config.columns = [];
      }
      return config.columns;
    }

    this.addColumn = function(){
      getColumns().push({});
    };

    this.removeColumn = function(index){
      getColumns().splice(index, 1);
    };
  })
  .controller('tableController', function(data){
    this.data = data;
  });
