(function() {

	var messages = {
		general: {
			previousMonth:  '이전달',
			nextMonth:      '다음달',
			january:        '1월',
			february:       '2월',
			march:          '3월',
			april:          '4월',
			may:            '5월',
			june:           '6월',
			july:           '7월',
			august:         '8월',
			september:      '9월',
			october:        '10월',
			november:       '11월',
			december:       '12월',
			sunday:         '일요일',
			sundayShort:    '일',
			monday:         '월요일',
			mondayShort:    '월',
			tuesday:        '화요일',
			tuesdayShort:   '화',
			wednesday:      '수요일',
			wednesdayShort: '수',
			thursday:       '목요일',
			thursdayShort:  '목',
			friday:         '금요일',
			fridayShort:    '금',
			saturday:       '토요일',
			saturdayShort:  '토',
		},
		'header-navigation': {
			login:       '로그인',
			register:    '가입',
			logout:      '로그아웃',
			profile:     '내 정보',
			searchOrder: '주문 조회',
			cart:        '카트',
		},
		'social-login': {
			loginByFacebook:     '페이스북으로 로그인',
			loginByGoogle:       '구글로 로그인',
			loginByInstagram:    '인스타그램으로 로그인',
			loginByKakao:        '카카오로 로그인',
			loginByNaver:        '네이버로 로그인',
			registerByFacebook:  '페이스북으로 가입',
			registerByGoogle:    '구글로 가입',
			registerByInstagram: '인스타그램으로 가입',
			registerByKakao:     '카카오로 가입',
			registerByNaver:     '네이버로 가입',
		},
		'customer-register': {
			register:                 '가입',
			userId:                   '아이디',
			email:                    '이메일 주소',
			password:                 '비밀번호',
			alias:                    '디스플레이명',
			firstName:                '이름',
			lastName:                 '성',
			fullName:                 '성명',
			mobile:                   '무선 번호',
			phone:                    '유선 번호',
			gender:                   '성별',
			noSelect:                 '선택 없음',
			male:                     '남성',
			female:                   '여성',
			birthdate:                '생일',
			year:                     '년',
			month:                    '월',
			date:                     '일',
			required:                 '필수',
			agreeWithTerms:           '이용 약관에 동의합니다.',
			viewTerms:                '이용 약관 보기',
			agreeWithPrivacy:         '개인정보 수집·이용에 동의합니다.',
			viewPrivacy:              '개인정보 수집·이용 보기',
			agreeWithAll:             '전체 동의',
			doRegister:               '가입하기',
			registerSuccess:          '성공적으로 가입되었습니다.',
			registerFailed:           '가입에 실패했습니다.',
			duplicatedEmail:          '이미 해당 이메일 주소로 가입된 계정이 있습니다.',
			duplicatedUserId:         '이미 해당 아이디로로 가입된 계정이 있습니다.',
			userIdRequired:           '아이디를 입력해야합니다.',
			emailRequired:            '이메일 주소를 입력해야합니다.',
			passwordRequired:         '비밀번호를 입력해야합니다.',
			aliasRequired:            '디스플레이명을 입력해야합니다.',
			firstNameRequired:        '이름을 입력해야합니다.',
			lastNameRequired:         '성을 입력해야합니다.',
			fullNameRequired:         '성명을 입력해야합니다.',
			mobileRequired:           '무선 번호를 입력해야합니다.',
			phoneRequired:            '유선 번호를 입력해야합니다.',
			genderRequired:           '성별을 입력해야합니다.',
			birthdateRequired:        '생일을 입력해야합니다.',
			termsAgreementRequired:   '이용 약관에 동의해야합니다.',
			privacyAgreementRequired: '개인정보 수집·이용에 동의해야합니다.',
			invalidUserId:            '잘못된 형식의 아이디입니다.',
			invalidEmail:             '잘못된 형식의 이메일 주소입니다.',
			invalidPassword:          '잘못된 형식의 비밀번호입니다.',
			invalidAlias:             '잘못된 형식의 디스플레이명입니다.',
			invalidFirstName:         '잘못된 형식의 이름입니다.',
			invalidLastName:          '잘못된 형식의 성입니다.',
			invalidFullName:          '잘못된 형식의 성명입니다.',
			invalidMobile:            '잘못된 형식의 무선 번호입니다.',
			invalidPhone:             '잘못된 형식의 유선 번호입니다.',
			invalidGender:            '잘못된 형식의 성별입니다.',
			invalidBirthdate:         '잘못된 형식의 생일입니다.',
		},
		'customer-login': {
			login:               '로그인',
			userIdOrEmail:       '아이디 혹은 이메일',
			password:            '비밀번호',
			doLogin:             '로그인하기',
			goToResetPassword:   '비밀번호 찾기',
			loginSuccess:        '성공적으로 로그인되었습니다.',
			loginFailed:         '로그인에 실패했습니다.',
			notExistingCustomer: '존재하지 않는 계정입니다.',
			invalidPassword:     '잘못된 비밀번호입니다.',
		},
		'customer-reset-password': {
			resetPassword:        '비밀번호 재설정',
			userIdOrEmail:        '아이디 혹은 이메일',
			requestEmail:         '이메일 요청',
			requestEmailSuccess:  '비밀번호 변경 이메일이 성공적으로 요청되었습니다.',
			newPassword:          '새로운 비밀번호',
			setPassword:          '비밀번호 설정하기',
			setPasswordSuccess:   '비밀번호가 성공적으로 설정되었습니다.',
			setPasswordFailed:    '비밀번호 설정에 실패했습니다.',
			notExistingCustomer:  '존재하지 않는 계정입니다.',
			customerWithoutEmail: '이메일이 설정되지 않은 계정입니다.',
			requestEmailFailed:   '비밀번호 재설정 이메일 요청에 실패했습니다.',
			goToCustomerLogin:    '로그인하러 가기',
		},
		'customer-verification': {
			verifyEmail:          '이메일 인증',
			userIdOrEmail:        '아이디 혹은 이메일',
			requestEmail:         '이메일 요청',
			requestEmailSuccess:  '인증 이메일이 성공적으로 요청되었습니다.',
			finishVerification:   '인증 완료하기',
			verificationSuccess:  '성공적으로 인증되었습니다.',
			verificationFailed:   '인증에 실패했습니다.',
			notExistingCustomer:  '존재하지 않는 계정입니다.',
			customerWithoutEmail: '이메일이 설정되지 않은 계정입니다.',
			requestEmailFailed:   '인증 이메일 요청에 실패했습니다.',
		},
		'customer-dashboard': {
			customerInfo:           '기본 정보',
			customerAddress:        '기본 주소',
			orderList:              '주문 내역',
			subscriptionList:       '정기 주문 내역',
			customerCoupons:        '쿠폰 목록',
			customerReviews:        '내 후기',
			customerReviewComments: '내 후기 댓글',
			customerDeleteAccount:  '계정 삭제',
			customerLogout:         '로그아웃'
		},
		'customer-update': {
			customerInfo:        '고객 기본 정보',
			backToCheckout:      '주문으로 돌아가기',
			changeAvatar:        '프로필 이미지 변경',
			userId:              '아이디',
			changeUserId:        '아이디 수정하기',
			email:               '이메일 주소',
			changeEmail:         '이메일 주소 수정하기',
			alias:               '디스플레이명',
			firstName:           '이름',
			lastName:            '성',
			fullName:            '성명',
			mobile:              '무선 번호',
			phone:               '유선 번호',
			gender:              '성별',
			noSelect:            '선택 없음',
			male:                '남성',
			female:              '여성',
			birthdate:           '생일',
			year:                '년',
			month:               '월',
			date:                '일',
			required:            '필수',
			doUpdate:            '수정하기',
			changePassword:      '비밀번호 수정하기',
			avatarUploadSuccess: '프로필 이미지가 성공적으로 수정되었습니다.',
			avatarUploadFailed:  '프로필 이미지 수정에 실패했습니다.',
			updateSuccess:       '성공적으로 수정되었습니다.',
			updateFailed:        '고객 정보 수정에 실패했습니다.',
			customerReadFailed:  '고객 정보를 읽어오는데 실패했습니다.',
			aliasRequired:       '디스플레이명을 입력해야합니다.',
			firstNameRequired:   '이름을 입력해야합니다.',
			lastNameRequired:    '성을 입력해야합니다.',
			fullNameRequired:    '성명을 입력해야합니다.',
			mobileRequired:      '무선 번호를 입력해야합니다.',
			phoneRequired:       '유선 번호를 입력해야합니다.',
			genderRequired:      '성별을 입력해야합니다.',
			birthdateRequired:   '생일을 입력해야합니다.',
			invalidAlias:        '잘못된 형식의 디스플레이명입니다.',
			invalidFirstName:    '잘못된 형식의 이름입니다.',
			invalidLastName:     '잘못된 형식의 성입니다.',
			invalidFullName:     '잘못된 형식의 성명입니다.',
			invalidMobile:       '잘못된 형식의 무선 번호입니다.',
			invalidPhone:        '잘못된 형식의 유선 번호입니다.',
			invalidGender:       '잘못된 형식의 성별입니다.',
			invalidBirthdate:    '잘못된 형식의 생일입니다.',
		},
		'customer-update-credential': {
			changeUserId:       '아이디 변경',
			changeEmail:        '이메일 주소 변경',
			changePassword:     '비밀번호 변경',
			newEmail:           '새로운 이메일 주소',
			newPassword:        '새로운 비밀번호',
			newUserId:          '새로운 아이디',
			oldPassword:        '현재 비밀번호',
			doChange:           '변경하기',
			updateCustomer:     '기본 정보 수정하기',
			updateSuccess:      '성공적으로 변경되었습니다.',
			updateFailed:       '변경에 실패했습니다.',
			invalidPassword:    '잘못된 비밀번호입니다.',
			duplicatedUserId:   '이미 사용중인 아이디입니다.',
			duplicatedEmail:    '이미 사용중인 이메일 주소입니다.',
			invalidNewUserId:   '잘못된 형식의 아이디입니다.',
			invalidNewEmail:    '잘못된 형식의 이메일 주소입니다.',
			invalidNewPassword: '잘못된 형식의 비밀번호입니다.',
		},
		'customer-update-address': {
			primaryAddress:     '기본 주소',
			required:           '필수',
			firstName:          '수취자 이름',
			lastName:           '수취자 성',
			fullName:           '수취자명',
			mobile:             '무선 연락처',
			phone:              '유선 연락처',
			country:            '국가',
			state:              '도',
			city:               '시',
			address1:           '주소',
			address2:           '상세주소',
			postcode:           '우편번호',
			searchAddress:      '주소 찾기',
			setPrimaryAddress:  '설정하기',
			updateSuccess:      '성공적으로 설정되었습니다.',
			updateFailed:       '설정에 실패했습니다.',
			customerReadFailed: '고객 정보를 읽어오는데 실패했습니다.',
			firstNameRequired:  '수취자 이름을 입력해야합니다.',
			lastNameRequired:   '수취자 성을 입력해야합니다.',
			fullNameRequired:   '수취자명을 입력해야합니다.',
			mobileRequired:     '무선 연락처를 입력해야합니다.',
			phoneRequired:      '유선 연락처를 입력해야합니다.',
			countryRequired:    '국가를 입력해야합니다.',
			stateRequired:      '도를 입력해야합니다.',
			cityRequired:       '시를 입력해야합니다.',
			address1Required:   '주소를 입력해야합니다.',
			address2Required:   '상세주소를 입력해야합니다.',
			postcodeRequired:   '우편번호를 입력해야합니다.',
			invalidFirstName:   '잘못된 형식의 수취자 이름입니다.',
			invalidLastName:    '잘못된 형식의 수취자 성입니다.',
			invalidFullName:    '잘못된 형식의 수취자명입니다.',
			invalidMobile:      '잘못된 형식의 무선 연락처입니다.',
			invalidPhone:       '잘못된 형식의 유선 연락처입니다.',
			invalidCountry:     '잘못된 형식의 국가입니다.',
			invalidState:       '잘못된 형식의 도입니다.',
			invalidCity:        '잘못된 형식의 시입니다.',
			invalidAddress1:    '잘못된 형식의 주소입니다.',
			invalidAddress2:    '잘못된 형식의 상세주소입니다.',
			invalidPostcode:    '해당 국가에 적합하지 않은 우편번호 형식입니다.',
		},
		'customer-delete-account': {
			deleteAccount: '계정 삭제',
			doDelete:      '계정 삭제하기',
			deleteConfirm: '정말 삭제하시겠습니까?',
			deleteSuccess: '성공적으로 삭제되었습니다.',
			deleteFailed:  '계정 삭제에 실패했습니다.',
		},
		'customer-coupons': {
			coupons:                   '쿠폰 목록',
			hasNoCoupons:              '소유 쿠폰이 하나도 없습니다.',
			productType:               '한 상품 적용',
			cartType:                  '카트 적용',
			shippingType:              '배송비 적용',
			valueDiscount:             '%{discount} 할인',
			firstNOrdersDiscounted:    '정기 주문시 첫 %{smart_count}회 주문에 할인 적용',
			lastNOrdersDiscounted:     '정기 주문시 마지막 %{smart_count}회 주문에 할인 적용',
			allOrdersDiscounted:       '정기 주문시 매 주문에 할인 적용',
			minDiscount:               '최소 %{min} 할인',
			maxDiscount:               '최대 %{max} 할인',
			usedOnly:                  '다른 할인이 없는 경우에만 사용 가능',
			usedTogether:              '다른 할인이 있어도 사용 가능',
			applicableProductPrice:    '적용 가능 상품가',
			applicableOrderTotal:      '적용 가능 주문 총액',
			applicableShipmentFee:     '적용 가능 배송 내역 배송비',
			greaterThanEqual:          '%{price} 이상',
			lessThanEqual:             '%{price} 이하',
			onlyForCertainProducts:    '특정 상품에만 사용 가능',
			onlyForCertainBrands:      '특정 브랜드에만 사용 가능',
			onlyForCertainCollections: '특정 콜렉션에만 사용 가능',
			canOnlyUsedFor:            '%{items}에만 사용 가능한 쿠폰입니다.',
			cannotUsedFor:             '%{items} 외에만 사용 가능한 쿠폰입니다.',
			expiresAt:                 '%{time}에 만료',
			withoutExpiration:         '만료일시 없음',
			inactiveCoupon:            '사용이 불가능한 쿠폰입니다.',
			deleteCoupon:              '쿠폰 제거',
			deleteSuccess:             '쿠폰이 성공적으로 제거되었습니다.',
			deleteConfirm:             '정말 제거하시겠습니까?',
			couponListFailed:          '쿠폰 목록을 읽어오는데 실패했습니다.',
			couponDeleteFailed:        '쿠폰을 삭제하는데 실패했습니다.',
		},
		'customer-reviews': {
			reviewListFailed:          '후기 목록을 읽어오는데 실패했습니다.',
			customerReviews:           '후기 목록',
			noCustomerReviews:         '작성한 후기가 하나도 없습니다.',
			reviewWrittenAt:           '%{time} 작성됨',
			totalNCustomerFindHelpful: '%{count}명이 도움이 된다고 평가',
			totalComment:              '%{count}개의 댓글',
			viewReview:                '자세히 보기',
		},
		'customer-review': {
			customerReview: '후기',
			backToReviews:  '목록으로 돌아가기',
		},
		'customer-review-comments': {
			commentListFailed:  '댓글 목록을 읽어오는데 실패했습니다.',
			customerComments:   '댓글 목록',
			noCustomerComments: '작성한 댓글이 하나도 없습니다.',
			commentFor:         '후기 “%{review}”에 대한 댓글',
			commentWrittenAt:   '%{time} 작성됨',
			viewComment:        '자세히 보기',
		},
		'customer-review-comment': {
			customerReviewComment: '댓글',
			backToComments:        '목록으로 돌아가기',
		},
		'product-list': {
			productListFailed: '상품 목록을 읽어오는데 실패했습니다.',
			unAvailable:       'UNAVAILABLE',
			soldout:           'SOLDOUT',
			discount:          'SALE'
		},
		'product-detail': {
			quantity:                          '수량',
			selectVariant:                     '세부 옵션 선택',
			notAvailableVariant:               '구매 불가',
			soldOutVariant:                    '품절',
			selectShippingMethod:              '배송 방식 선택',
			selectBundleItems:                 '추가 구매 상품 선택',
			requiredBundle:                    '필수',
			addToCart:                         '카트에 담기',
			itemAddSuccess:                    '카트에 성공적으로 담았습니다.',
			variantRequired:                   '세부 옵션을 선택해야합니다.',
			invalidRequiredBundleItemQuantity: '“%{bundle}”의 구매 수량은 모상품의 구매 수량과 동일해야합니다.',
			requiredBundleItemRequired:        '“%{bundle}”의 추가 구매 상품을 선택해야합니다.',
			itemQuantityRequired:              '“%{scope}” 구매 수량은 1개 이상이어야 합니다.',
			exceededItemQuantity:              '“%{scope}” 선택 옵션의 구매 가능 수량보다 많이 담을 수 없습니다.',
			itemsExceeded:                     '카트에 담을 수 있는 수량을 초과했습니다.',
			itemAddFailed:                     '카트 담기에 실패했습니다.',
			goToCart:                          '카트로 가기',
			buyNow:                            '바로 구매',
			unavailableProduct:                '구매 불가 상품',
			notExistingProduct:                '존재하지 않는 상품입니다.',
			productReadFailed:                 '상품을 읽어오는데 실패했습니다.',
			productInfo:                       '상품 정보',
			productReviews:                    '상품 후기',
		},
		'product-review': {
			reviewReadFailed:          '후기를 읽어오는데 실패했습니다.',
			deletedCustomer:           '삭제된 유저',
			reviewWrittenAt:           '%{time} 작성됨',
			totalNCustomerFindHelpful: '%{count}명이 도움이 된다고 평가',
			readMore:                  '모든 내용 보기',
			addImage:                  '이미지 추가하기',
			imageUploadFailed:         '이미지 업로드에 실패했습니다.',
			deleteImage:               '제거하기',
			imageDeleteFailed:         '이미지 삭제에 실패했습니다.',
			helpful:                   '도움됨',
			unhelpful:                 '도움되지 않음',
			helpVoteSuccess:           '성공적으로 평가되었습니다.',
			helpVoteFailed:            '평가에 실패했습니다.',
			duplicatedVote:            '이미 평가하였습니다.',
			writeComment:              '댓글 작성',
			totalComment:              '%{count}개의 댓글',
			editReview:                '수정하기',
			saveReview:                '수정 완료',
			reviewSaveSuccess:         '수정에 성공했습니다.',
			reviewSaveFailed:          '수정에 실패했습니다.',
			titleRequired:             '제목을 입력해야합니다.',
			deleteReview:              '삭제하기',
			deleteConfirm:             '정말 삭제하시겠습니까?',
			deleteSuccess:             '성공적으로 삭제되었습니다.',
			deleteFailed:              '삭제에 실패했습니다.',
			flagReview:                '신고하기',
			flagSuccess:               '성공적으로 신고되었습니다.',
			flagFailed:                '신고에 실패했습니다.',
			duplicatedFlag:            '이미 신고되었습니다.',
			loginRequired:             '로그인이 필요합니다.',
		},
		'product-reviews': {
			reviewListFailed: '후기 목록을 읽어오는데 실패했습니다.',
			loginRequired:    '로그인이 필요합니다.',
			productReviews:   '상품 후기',
			totalNReviews:    '총 %{count}개의 상품 후기',
			productRating:    '%{rating}점',
			noProductReviews: '작성된 상품 후기가 하나도 없습니다.',
			writeReview:      '상품 후기 작성하기',
		},
		'product-review-writer': {
			reviewRating:        '별점',
			reviewTitle:         '제목',
			reviewBody:          '내용',
			addImage:            '이미지 추가하기',
			imageUploadFailed:   '이미지 업로드에 실패했습니다.',
			deleteImage:         '제거하기',
			postReview:          '작성 완료',
			cancelReview:        '작성 취소',
			reviewPostSuccess:   '상품 후기가 작성되었습니다.',
			reviewPostFailed:    '상품 후기 작성에 실패했습니다.',
			reviewReadFailed:    '작성한 상품 후기를 읽어오는데 실패했습니다.',
			titleRequired:       '제목을 입력해야합니다.',
			notPurchasedProduct: '구매하지 않은 상품입니다.',
		},
		'product-review-comments': {
			loginRequired:       '로그인이 필요합니다.',
			commentListFailed:   '댓글 목록을 읽어오는데 실패했습니다.',
			noReviewComments:    '댓글이 하나도 없습니다.',
			writeComment:        '댓글 작성하기',
			commentBody:         '댓글 내용',
			postComment:         '작성 완료',
			cancelComment:       '작성 취소',
			bodyRequired:        '내용을 입력해야합니다.',
			commentPostSuccess:  '댓글이 작성되었습니다.',
			commentPostFailed:   '댓글 작성에 실패했습니다.',
			commentReadFailed:   '작성한 댓글을 읽어오는데 실패했습니다.',
			deletedCustomer:     '삭제된 유저',
			deletedCollaborator: '삭제된 관리자',
			commentWrittenAt:    '%{time} 작성됨',
			readMore:            '모든 내용 보기',
			editComment:         '수정하기',
			saveComment:         '수정 완료',
			saveSuccess:         '수정에 성공했습니다.',
			saveFailed:          '수정에 실패했습니다.',
			deleteComment:       '삭제하기',
			deleteConfirm:       '정말 삭제하시겠습니까?',
			deleteSuccess:       '성공적으로 삭제되었습니다.',
			deleteFailed:        '삭제에 실패했습니다.',
			flagComment:         '신고하기',
			flagSuccess:         '성공적으로 신고되었습니다.',
			flagFailed:          '신고에 실패했습니다.',
			duplicatedFlag:      '이미 신고되었습니다.',
		},
		cart: {
			cart:                              '카트',
			cartReadFailed:                    '카트 정보를 읽어오는데 실패했습니다.',
			itemInfo:                          '상품 정보',
			itemQuantity:                      '수량',
			itemPrice:                         '가격',
			deletedProduct:                    '삭제된 상품',
			hasNoItems:                        '카트에 상품이 하나도 없습니다.',
			itemOption:                        '상품 옵션',
			shippingMethod:                    '배송 방식',
			noProduct:                         '삭제된 상품',
			noVariant:                         '삭제된 상품 옵션',
			notAvailableProduct:               '구매 불가능한 상품',
			notAvailableVariant:               '구매 불가능한 상품 옵션',
			soldOutVariant:                    '품절된 상품',
			exceededItemQuantity:              '구매 가능 수량 초과',
			shippingMethodRequired:            '배송 방식 선택 필요',
			nonShippableProduct:               '배송 불가능한 상품',
			notSupportedShippingMethod:        '지원되지 않는 배송 방식',
			noBundleItem:                      '지원되지 않는 추가 구매 상품',
			requiredBundleItemRequired:        '필수 추가 구매 상품 필요',
			invalidRequiredBundleItemQuantity: '필수 추가 구매 상품 수량 조정 필요',
			deleteItemFailed:                  '상품 제거에 실패했습니다.',
			applyChanges:                      '변경 사항 카트 적용',
			itemUpdateFailed:                  '수량 변경에 실패했습니다.',
			itemTotal:                         '상품 합계',
			doOrder:                           '주문하기',
			doSubscription:                    '정기 주문하기',
			isEmptyCart:                       '주문 가능한 상품이 하나도 없습니다.',
			hasErredItem:                      '주문이 불가능한 상품이 포함되어 있습니다.',
		},
		checkout: {
			checkoutPreparationFailed:    '주문에 필요한 정보를 가져오는데 실패했습니다.',
			invalidCartItemIncluded:      '주문할 수 없는 상품이 포함되어 있습니다. 구매 상품을 리뷰해 주세요.',
			invalidPostcode:              '지원되지 않는 우편번호 형식입니다.',
			startsTooEarly:               '정기 구독 시작 일시가 너무 이릅니다.',
			cartCouponCategory:           '카트 쿠폰이 적용되는 상품이 하나도 없습니다.',
			cartCouponPrice:              '카트 쿠폰을 적용할 수 없는 주문 총액입니다.',
			cartUpdateFailed:             '카트에 변경 사항을 반영하는데 실패했습니다.',
			confirmItems:                 '구매 상품 확인',
			backToCart:                   '카트로 돌아가기',
			itemInfo:                     '상품 정보',
			itemQuantity:                 '수량',
			itemPrice:                    '가격',
			itemOption:                   '상품 옵션',
			shippingMethod:               '배송 방식',
			appliedCoupon:                '적용 쿠폰',
			selectProductCoupon:          '상품 쿠폰 선택',
			selectCartCoupon:             '카트 쿠폰 선택',
			alreadyDiscounted:            '이미 할인된 경우 적용할 수 없는 쿠폰입니다.',
			mustBeOneQuantity:            '담은 수량이 1개인 품목에만 적용할 수 있습니다.',
			duplicatedCoupon:             '동일한 쿠폰을 여러품목에 적용할 수 없습니다.',
			applyCoupons:                 '쿠폰 적용',
			finishApplyingCoupons:        '쿠폰 적용 완료',
			selectSubscriptionPlanFirst:  '정기 주문 방식을 먼저 선택해야합니다.',
			required:                     '필수',
			setCustomer:                  '주문자 정보',
			customerFirstName:            '주문자 이름',
			customerLastName:             '주문자 성',
			customerFullName:             '주문자명',
			customerEmail:                '이메일',
			customerMobile:               '무선 연락처',
			customerPhone:                '유선 연락처',
			goToUpdateCustomer:           '내 기본 정보 변경',
			sameForRecipient:             '수취자 정보도 위와 동일합니다.',
			customerFirstNameRequired:    '주문자 이름을 입력해야합니다.',
			customerLastNameRequired:     '주문자 성을 입력해야합니다.',
			customerFullNameRequired:     '주문자명을 입력해야합니다.',
			customerEmailRequired:        '이메일을 입력해야합니다.',
			customerMobileRequired:       '무선 연락처을 입력해야합니다.',
			customerPhoneRequired:        '유선 연락처을 입력해야합니다.',
			setShippingAddress:           '배송 주소',
			shippingInfo:                 '수취자 정보',
			addressFirstName:             '수취자 이름',
			addressLastName:              '수취자 성',
			addressFullName:              '수취자명',
			addressMobile:                '무선 연락처',
			addressPhone:                 '유선 연락처',
			addressCountry:               '국가',
			addressState:                 '도',
			addressCity:                  '시',
			addressAddress1:              '주소',
			addressAddress2:              '상세주소',
			addressPostcode:              '우편번호',
			searchAddress:                '주소 찾기',
			saveAsPrimaryAddress:         '이 주소를 기본 주소로 저장',
			applyCouponsFirst:            '쿠폰 적용을 먼저 끝내야합니다.',
			applyAddress:                 '설정된 주소 적용',
			doOrder:                      '주문하기',
			doSubscription:               '정기 주문하기',
			addressFirstNameRequired:     '수취자 이름을 입력해야합니다.',
			addressLastNameRequired:      '수취자 성을 입력해야합니다.',
			addressFullNameRequired:      '수취자명을 입력해야합니다.',
			addressMobileRequired:        '무선 연락처를 입력해야합니다.',
			addressPhoneRequired:         '유선 연락처를 입력해야합니다.',
			addressCountryRequired:       '배송 주소의 국가를 입력해야합니다.',
			addressStateRequired:         '배송 주소의 도를 입력해야합니다.',
			addressCityRequired:          '배송 주소의 시를 입력해야합니다.',
			addressAddress1Required:      '배송 주소의 주소를 입력해야합니다.',
			addressAddress2Required:      '배송 주소의 상세 주소를 입력해야합니다.',
			addressPostcodeRequired:      '배송 주소의 우편번호를 입력해야합니다.',
			orderRequest:                 '요청 사항',
			typeOrderRequest:             '요청 사항을 입력해주세요.',
			subscription:                 '정기 주문',
			subscriptionPlan:             '정기 주문 방식',
			subscriptionPlanRequired:     '정기 주문 방식을 선택해주세요.',
			selectSubscriptionPlan:       '정기 주문 방식 선택',
			firstOrderStartsAt:           '첫 주문일',
			secondOrderStartsAt:          '두번째 주문일',
			subscriptionStartsAtRequired: '주문 시작일을 선택해주세요.',
			selectSubscriptionStartsAt:   '주문 시작일 선택',
			firstOrderIsImmediate:        '첫 주문은 즉시 주문됩니다.',
			payment:                      '결제',
			orderSummary:                 '주문 요약',
			subscriptionSummary:          '정기 주문 요약',
			firstOrderSummary:            '첫 주문',
			firstNowOrder:                '즉시 주문',
			restOrdersSummary:            '이후 주문',
			itemTotal:                    '상품 합계',
			shippingTotal:                '배송비 합계',
			taxTotal:                     '부가세',
			orderTotal:                   '총계',
			agreeWithTerms:               '이용 약관에 동의합니다.',
			viewTerms:                    '이용 약관 보기',
			agreeWithPrivacy:             '개인정보 수집·이용에 동의합니다.',
			viewPrivacy:                  '개인정보 수집·이용 보기',
			agreeWithAll:                 '전체 동의',
			termsAgreementRequired:       '이용 약관에 동의해야합니다.',
			privacyAgreementRequired:     '개인정보 수집·이용에 동의해야합니다.',
			taxIncludedTip:               '부가세는 가격에 포함 되어있습니다.',
			taxExcludedTip:               '부가세는 가격에 미포함 되어있습니다.',
			shippingFeeAndTaxTip:         '배송비와 부가세는 배송 주소 설정 후에 계산됩니다.',
			proceedOrder:                 '주문 및 결제하기',
			proceedSubscription:          '정기 주문 및 결제하기',
			checkoutFailed:               '주문에 실패했습니다.',
			checkoutProcessFailed:        '주문 절차 진행에 실패했습니다.',
			paymentFailed:                '결제에 실패했습니다. 결제를 완료해주세요.',
			scheduleFailed:               '정기 주문 예약에 실패했습니다.'
		},
		'payment-form': {
			paymentMethod:               '결제 방식',
			cardNumber:                  '카드 번호',
			isCompanyCard:               '법인 카드',
			cardExpiration:              '만료일',
			cardPassword2:               '비밀번호 첫 2자리',
			cardOwnerBirthdate:          '생년월일',
			cardOwnerCompanyNumber:      '사업자등록번호',
			selectPaymentMethod:         '결제 방식을 선택해주세요.',
			paymentMethodRequired:       '결제 방식을 선택해주세요.',
			cardNumberRequired:          '카드 번호를 입력해주세요.',
			cardExpirationMonthRequired: '카드 만료 월을 입력해주세요.',
			cardExpirationYearRequired:  '카드 만료 년도를 입력해주세요.',
			cardPassword2Required:       '카드 비밀번호 첫 2자리를 입력해주세요.',
			cardOwnerRequired:           '생년월일 또는 사업자등록번호를 입력해주세요.',
		},
		'checkout-success': {
			copyIdButton:           '복사',
			orderSuccess:           '성공적으로 주문되었습니다!',
			orderSuccessBody:       '주문해 주셔서 감사합니다.',
			vbankInfo:               '가상 계좌 정보',
			vbankName:               '은행',
			vbankAccount:            '계좌번호',
			vbankAmount:             '금액',
			vbankExpiresAt:          '입금 기한',
			orderInfo:               '주문 정보',
			orderId:                 '주문 번호',
			orderedAt:               '주문 일시',
			orderReadFailed:         '해당 주문 정보를 읽는데 실패했습니다.',
			subscriptionSuccessBody: '주문해 주셔서 감사합니다.',
			subscriptionSuccess:     '성공적으로 정기 주문되었습니다!',
			subscriptionInfo:        '정기 주문 정보',
			subscriptionId:          '정기 주문 번호',
			subscribedAt:            '정기 주문 일시',
			subscriptionReadFailed:  '해당 정기 주문 정보를 읽는데 실패했습니다.',
			viewMoreDetails:         '더 자세히 확인하기',
		},
		'search-purchase': {
			searchOrder:             '주문 조회',
			searchSubscription:      '정기 주문 조회',
			orderId:                 '주문 번호',
			subscriptionId:          '정기 주문 번호',
			userId:                  '주문자 아이디',
			alias:                   '주문자 디스플레이명',
			email:                   '주문자 이메일 주소',
			mobile:                  '주문자 무선 번호',
			phone:                   '주문자 유선 번호',
			firstName:               '주문자 이름',
			lastName:                '주문자 성',
			fullName:                '주문자명',
			doSearch:                '조회하기',
			notExistingOrder:        '존재하지 않는 주문입니다.',
			notExistingSubscription: '존재하지 않는 정기 주문입니다.',
			invalidCustomerInfo:     '잘못된 주문자 정보입니다.',
			searchFailed:            '조회에 실패했습니다.',
			goToSearchOrder:         '주문 조회하기',
			goToSearchSubscription:  '정기 주문 조회하기',
		},
		'order-list': {
			orderListFailed:           '주문 목록을 읽어오는데 실패했습니다.',
			orderList:                 '주문 목록',
			orderId:                   '주문 번호',
			orderItems:                '구매 상품 정보',
			orderTotal:                '주문 금액',
			orderCreatedAt:            '주문 일시',
			restNItems:                '외 %{smart_count}개의 상품',
			statusPlaced:              '결제 대기',
			statusCancelledByStore:    '운영자 취소',
			statusCancelledByCustomer: '고객 취소',
			statusPaid:                '결제 완료',
			statusUnderPaid:           '부분 결제',
			statusOverPaid:            '초과 결제',
			statusRefunded:            '환불 완료',
			statusPartiallyRefunded:   '부분 환불 완료',
			statusUnderRefunded:       '환불 처리 중',
			statusOverRefunded:        '초과 환불',
			shippingStatusPending:     '배송 대기',
			shippingStatusShipped:     '배송중',
			shippingStatusArrived:     '배송 완료',
			shippingStatusReceived:    '수령 완료',
			orderSubscription:         '정기 주문',
		},
		'order-detail': {
			orderReadFailed:                 '주문을 읽어오는데 실패했습니다.',
			orderDetail:                     '주문 내역',
			backToOrders:                    '목록으로 돌아가기',
			backToSubscription:              '정기 주문 내역으로 돌아가기',
			orderBasicInfo:                  '기본 정보',
			statusPlaced:                    '결제 대기',
			statusCancelledByStore:          '운영자 취소',
			statusCancelledByCustomer:       '고객 취소',
			statusPaid:                      '결제 완료',
			statusUnderPaid:                 '부분 결제',
			statusOverPaid:                  '초과 결제',
			statusRefunded:                  '환불 완료',
			statusPartiallyRefunded:         '부분 환불 완료',
			statusUnderRefunded:             '환불 처리 중',
			statusOverRefunded:              '초과 환불',
			shippingStatusPending:           '배송 대기',
			shippingStatusShipped:           '배송중',
			shippingStatusArrived:           '배송 완료',
			shippingStatusReceived:          '수령 완료',
			orderSyncFailed:                 '주문에 실패했습니다. 관리자에게 문의해주세요.',
			orderId:                         '주문 번호',
			subscriptionId:                  '정기 주문 번호',
			orderCreatedAt:                  '%{time}에 주문',
			orderCancellation:               '취소 내용',
			orderRequest:                    '요청 사항',
			cancellationDetail:              '취소 정보',
			cancellationReason:              '취소 사유',
			cancelOrder:                     '취소하기',
			startCancellation:               '주문 취소하기',
			invalidOrderStatus:              '해당 작업을 수행할 수 없는 상태입니다.',
			cancellationFailed:              '취소에 실패했습니다.',
			cancellationSuccess:             '성공적으로 취소되었습니다.',
			orderTransactionSummary:         '금액 정보',
			orderTotalPaid:                  '결제 금액',
			orderTotalCancelled:             '결제 취소 금액',
			orderTotalRefunded:              '그 외 환불 금액',
			vbankInfo:                       '가상 계좌 정보',
			vbankName:                       '은행',
			vbankNumber:                     '계좌번호',
			vbankAmount:                     '입금 금액',
			vbankExpiresAt:                  '입금 기한',
			processPayment:                  '주문 결제',
			makePayment:                     '결제하기',
			paymentFailed:                   '결제에 실패했습니다.',
			paymentSuccess:                  '성공적으로 결제되었습니다.',
			orderItemDetails:                '주문 품목',
			itemInfo:                        '상품 정보',
			itemQuantity:                    '수량',
			itemPrice:                       '가격',
			itemOption:                      '상품 옵션',
			shippingMethod:                  '배송 방식',
			appliedCoupon:                   '적용 쿠폰',
			discountedBy:                    '%{value} 할인',
			itemTotal:                       '상품 합계',
			shippingTotal:                   '배송비 합계',
			taxTotal:                        '부가세',
			taxIncluded:                     '가격에 포함',
			taxExcluded:                     '가격에 미포함',
			orderTotal:                      '총계',
			orderCustomerInfo:               '고객 및 주소',
			orderCustomer:                   '주문 고객',
			customerFirstName:               '주문자 이름',
			customerLastName:                '주문자 성',
			customerFullName:                '주문자명',
			customerEmail:                   '이메일',
			customerMobile:                  '무선 연락처',
			customerPhone:                   '유선 연락처',
			orderShippingAddress:            '배송지 주소',
			addressFirstName:                '수취자 이름',
			addressLastName:                 '수취자 성',
			addressFullName:                 '수취자명',
			addressMobile:                   '무선 연락처',
			addressPhone:                    '유선 연락처',
			addressCountry:                  '국가',
			addressState:                    '도',
			addressCity:                     '시',
			addressAddress1:                 '주소',
			addressAddress2:                 '상세주소',
			addressPostcode:                 '우편번호',
			orderRefunds:                    '환불 내역',
			requestRefund:                   '환불 요청',
			noRefunds:                       '환불 내역이 없습니다.',
			refundStatus:                    '환불 상태',
			refundItems:                     '환불 품목',
			refundTotal:                     '환불 금액',
			refundStatusRequested:           '승인 대기',
			refundStatusCancelledByStore:    '운영자 취소',
			refundStatusCancelledByCustomer: '고객 취소',
			refundStatusAccepted:            '환불 승인',
			cancelRefund:                    '환불 요청 취소',
			invalidRefundStatus:             '해당 작업을 수행할 수 없는 상태입니다.',
			refundCancellationFailed:        '환불 요청 취소에 실패했습니다.',
			refundCancellationSuccess:       '환불 요청이 취소되었습니다.',
			refundCancellationReason:        '환불 취소 사유',
			refundItemTotal:                 '상품 환불액: %{total}',
			refundShippingTotal:             '배송비 환불액: %{total}',
			orderFulfillments:               '배송 내역',
			markAsReceived:                  '배송 수령 완료 처리',
			markAsReceivedSuccess:           '배송 수령 완료 상태로 변경되었습니다.',
			markAsReceivedFailed:            '배송 수령 완료 상태 변경에 실패했습니다.',
			markAsNotReceived:               '배송 수령 미완료 처리',
			markAsNotReceivedSuccess:        '배송 수령 미완료 상태로 변경되었습니다.',
			markAsNotReceivedFailed:         '배송 수령 미완료 상태 변경에 실패했습니다.',
			noFulfillments:                  '배송 내역이 없습니다.',
			fulfillmentStatus:               '배송 상태',
			fulfillmentItems:                '배송 품목',
			fulfillmentStatusPending:        '배송 대기',
			fulfillmentStatusShipped:        '배송중',
			fulfillmentStatusArrived:        '배송 완료',
			viewTracker:                     '배송 조회',
		},
		'order-request-refund': {
			orderReadFailed:        '주문을 읽어오는데 실패했습니다.',
			currencyReadFailed:     '주문 통화를 읽어오는데 실패했습니다.',
			orderRequestRefund:     '환불 요청',
			backToOrder:            '주문으로 돌아가기',
			hasNoRefundableItem:    '환불 가능한 상품이 하나도 없습니다.',
			refundItems:            '환불 요청 품목',
			itemInfo:               '상품 정보',
			itemRefundQuantity:     '환불 수량',
			itemRefundAmount:       '환불 금액',
			itemOption:             '상품 옵션',
			shippingMethod:         '배송 방식',
			addToRefund:            '환불 내역에 추가',
			removeFromRefund:       '환불 내역에서 제거',
			refundSummary:          '환불 정보',
			refundReason:           '환불 사유',
			selectRefundReason:     '환불 사유 선택',
			typeDetailedReason:     '자세한 환불 이유를 입력해주세요.',
			totalSummary:           '환불 금액',
			selectReasonFirst:      '환불 사유 선택후에 계산됩니다.',
			itemsTotal:             '상품 환불액',
			shippingTotal:          '배송비 환불액',
			total:                  '총계',
			requestRefund:          '환불 요청하기',
			requestRefundSuccess:   '성공적으로 환불 요청 처리되었습니다.',
			requestRefundFailed:    '환불 요청 처리에 실패했습니다.',
			invalidOrderStatus:     '해당 작업을 수행할 수 없는 상태입니다.',
			atLeastOneItemRequired: '환불하려는 상품을 선택해주세요.',
			reasonCategoryRequired: '환불 사유를 선택해주세요.'
		},
		'subscription-list': {
			subscriptionListFailed:    '정기 주문 목록을 읽어오는데 실패했습니다.',
			subscriptionList:          '정기 주문 목록',
			subscriptionId:            '정기 주문 번호',
			subscriptionItems:         '구매 상품 정보',
			subscriptionAmount:        '주문 금액',
			subscriptionPlan:          '주문 방식',
			subscriptionTime:          '주문 기간',
			restNItems:                '외 %{smart_count}개의 상품',
			statusPending:             '예약 대기',
			statusScheduling:          '예약 진행중',
			statusScheduled:           '정기 주문중',
			statusCancelling:          '취소 진행중',
			statusCancelledByStore:    '운영자 취소',
			statusCancelledByCustomer: '고객 취소',
		},
		'subscription-detail': {
			subscriptionReadFailed:      '정기 주문을 읽어오는데 실패했습니다.',
			subscriptionDetail:          '정기 주문 내역',
			backToSubscriptions:         '목록으로 돌아가기',
			backToOrder:                 '주문 내역으로 돌아가기',
			subscriptionBasicInfo:       '기본 정보',
			statusPending:               '예약 대기',
			statusScheduling:            '예약 진행중',
			statusScheduled:             '정기 주문중',
			statusCancelling:            '취소 진행중',
			statusCancelledByStore:      '운영자 취소',
			statusCancelledByCustomer:   '고객 취소',
			subscriptionId:              '정기 주문 번호',
			subscriptionPlan:            '정기 주문 방식',
			subscriptionSyncFailed:      '정기 주문에 실패했습니다. 관리자에게 문의해주세요.',
			subscriptionTimezone:        '기준 시간대',
			subscriptionCreatedAt:       '%{time} 시작',
			subscriptionEndsAt:          '%{time}까지 정기 주문',
			subscriptionCancellation:    '취소 내용',
			subscriptionRequest:         '요청 사항',
			cancellationDetail:          '취소 정보',
			cancellationReason:          '취소 사유',
			cancelSubscription:          '취소하기',
			startCancellation:           '정기 주문 취소',
			invalidSubscriptionStatus:   '해당 작업을 수행할 수 없는 상태입니다.',
			cancellationFailed:          '취소에 실패했습니다.',
			cancellationSuccess:         '성공적으로 취소되었습니다.',
			processPayment:              '정기 주문 결제',
			makePayment:                 '결제하기',
			paymentFailed:               '결제에 실패했습니다.',
			schedulingFailed:            '예약에 실패했습니다.',
			schedulingSuccess:           '성공적으로 결제되었습니다.',
			subscriptionItemDetails:     '정기 주문 품목',
			itemInfo:                    '상품 정보',
			itemQuantity:                '수량',
			itemPrice:                   '가격',
			itemOption:                  '상품 옵션',
			shippingMethod:              '배송 방식',
			appliedCoupon:               '적용 쿠폰',
			discountedBy:                '%{value} 할인',
			firstNTimesDiscounted:       '첫 %{count}회 주문 적용',
			lastNTimesDiscounted:        '마지막 %{count}회 주문 적용',
			allDiscounted:               '전체 주문 적용',
			subscriptionCustomerInfo:    '고객 및 주소',
			subscriptionCustomer:        '주문 고객',
			customerFirstName:           '주문자 이름',
			customerLastName:            '주문자 성',
			customerFullName:            '주문자명',
			customerEmail:               '이메일',
			customerMobile:              '무선 연락처',
			customerPhone:               '유선 연락처',
			subscriptionShippingAddress: '배송지 주소',
			addressFirstName:            '수취자 이름',
			addressLastName:             '수취자 성',
			addressFullName:             '수취자명',
			addressMobile:               '무선 연락처',
			addressPhone:                '유선 연락처',
			addressCountry:              '국가',
			addressState:                '도',
			addressCity:                 '시',
			addressAddress1:             '주소',
			addressAddress2:             '상세주소',
			addressPostcode:             '우편번호',
			subscriptionSchedules:       '정기 주문 일정',
			scheduleOrderId:             '주문 번호',
			scheduleStatusPending:       '주문 대기중',
			scheduleStatusCancelled:     '주문 취소됨',
			scheduleStatusDone:          '주문 완료',
			scheduleTime:                '주문 시점',
			scheduleTotalAmount:         '주문 금액',
			scheduleNow:                 '즉시 주문',
			viewAllSchedules:            '모든 일정 보기',
		},
		copyText: {
			copySuccess:            '성공적으로 복사되었습니다.',
			copyfailed:             '복사에 실패하였습니다.',
		}
	};


	if (typeof window !== 'undefined') {
		window.Thunder.setMessages(messages);
	} else if (typeof module !== 'undefined' &&
		typeof module.exports !== 'undefined') {
		module.exports = messages;
	}

}());