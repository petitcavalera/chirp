var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
    
  $http.get("auth/getUser").then(function(result) {     
      if(result.data != ''){
          $rootScope.authenticated = true;
          $rootScope.current_user = result.data.username;
      }else{
          $rootScope.authenticated = false;
          $rootScope.current_user = '';
      }
     $scope.currentUser = result.data;
  })
  

  $rootScope.signout = function(){
    $http.get('auth/signout');
    $rootScope.authenticated = false;
    $rootScope.current_user = '';
  };
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		})
        //the admin user display
		.when('/user', {
			templateUrl: 'adminuser.html',
			controller: 'adminUserController'
		})
    
        .when('/user/edit', {
			templateUrl: 'edituser.html',
			controller: 'editUserController'
		});
});

app.factory('postService', function($resource){
  return $resource('/api/posts/:id');
});

app.factory('userService', function($resource){
  return $resource('/user/:id', null,
                  {
      'update':{method:'PUT'}
  });
});
/*
app.factory('postService', function($http){
  var baseUrl = "/api/posts";
  var factory = {};
  factory.getAll = function(){
    return $http.get(baseUrl);
  };
  return factory;
});*/

app.controller('mainController', function($rootScope, $scope, postService){
	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};
	
   /* postService.getAll().success(function(data){
        $scope.posts = data;
    });
     */   
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};
    
    $scope.deletePost = function(post){        ;
       postService.delete({ id: post._id }, function() {
           $scope.posts = postService.query();
        });
    } 
    
});

app.controller('adminUserController', function($location, $rootScope, $scope, userService){
    $scope.users = userService.query();
    
    $scope.deleteUser = function(user){       
       userService.delete({ id: user._id }, function() {
           $scope.users = userService.query();
        });
    } 
    
    $scope.editUser = function(user){  
        $rootScope.editedUser = user;
        $location.path('user/edit');     
    } 
    
	/*$scope.newPost = {created_by: '', text: '', created_at: ''};
	
   
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};*/ 
});

app.controller('editUserController', function($location, $rootScope, $scope, userService){
    
    if($rootScope.editedUser === undefined){
        $location.path('/user');
    }
    $scope.user = $rootScope.editedUser;
    $scope.user.password = '';
    
    $scope.save = function (user){ 
        var userName = user.username;
        
         userService.update({ id: user._id }, user,function(data) {
         if(data.state == 'failure'){
            $scope.user.username = userName;
            $scope.error_message = data.message;
          }
          else{
               $location.path('user'); 

          }  
         
        });
    };

});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{        
        $scope.error_message = data.message;
      }
    });
  };
});

