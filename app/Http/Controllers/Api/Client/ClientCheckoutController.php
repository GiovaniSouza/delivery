<?php

namespace Delivery\Http\Controllers\Api\Client;

use Delivery\Http\Controllers\Controller;
use Delivery\Http\Requests\CheckoutRequest;
use Delivery\Repositories\OrderRepository;
use Delivery\Repositories\ProductRepository;
use Delivery\Repositories\UserRepository;
use Delivery\Services\OrderService;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;

class ClientCheckoutController extends Controller
{

    private $orderRepository;
    private $userRepository;
    private $productRepository;
    /**
     * @var OrderService
     */
    private $service;

    private $with = [
      'client',
      'cupom',
      'items'
    ];

    public function __construct(OrderRepository $orderRepository,
                                UserRepository $userRepository,
                                ProductRepository $productRepository,
                                OrderService $service)
    {

        $this->orderRepository = $orderRepository;
        $this->userRepository = $userRepository;
        $this->productRepository = $productRepository;
        $this->service = $service;
    }

    public function index()
    {
       $id = Authorizer::getResourceOwnerId();
       $clientId = $this->userRepository->find($id)->client->id;
       $orders = $this->orderRepository
            ->skipPresenter(false)
            ->with($this->with)
            ->scopeQuery(function ($query) use($clientId){
            return $query->where('client_id', '=', $clientId);
       })->paginate();

       return $orders;
    }

    public function store(CheckoutRequest $request)
    {
        $id = Authorizer::getResourceOwnerId();
        $data = $request->all();
        $clientId = $this->userRepository->find($id)->client->id;
        $data['client_id'] = $clientId;
        $o = $this->service->create($data);
        return $this->orderRepository
               ->skipPresenter(false)
               ->with($this->with)
               ->find($o->id);
    }

    public function show($id)
    {
        return $this->orderRepository
               ->skipPresenter(false)
               ->with($this->with)
               ->find($id);
    }

}
